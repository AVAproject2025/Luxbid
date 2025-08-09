import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, calculateCommission, calculateTotalWithCommission } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { listingId, offerId } = await request.json()

    if (!listingId || !offerId) {
      return NextResponse.json(
        { error: 'Listing ID and Offer ID are required' },
        { status: 400 }
      )
    }

    // Get the listing and offer
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Check if the offer belongs to the current user
    if (offer.buyerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only pay for your own offers' },
        { status: 403 }
      )
    }

    // Check if the listing is still active
    if (listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Listing is no longer active' },
        { status: 400 }
      )
    }

    // Check if the offer is still pending
    if (offer.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Offer is no longer pending' },
        { status: 400 }
      )
    }

    // Calculate commission and total
    const commission = calculateCommission(Number(offer.amount))
    const totalAmount = calculateTotalWithCommission(Number(offer.amount))

    // Create or get existing payment record
    let payment = await prisma.payment.findFirst({
      where: {
        listingId,
        buyerId: session.user.id,
        status: 'PENDING'
      }
    })

    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          amount: offer.amount,
          commission,
          buyerId: session.user.id,
          listingId,
          offerId,
          status: 'PENDING'
        }
      })
    }

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: listing.title,
              description: `Offer on ${listing.title}`,
              images: listing.images ? JSON.parse(listing.images).slice(0, 1) : [],
            },
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Platform Commission',
              description: '5% platform commission',
            },
            unit_amount: Math.round(commission * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/listings/${listingId}`,
      metadata: {
        paymentId: payment.id,
        listingId,
        offerId,
        buyerId: session.user.id,
        sellerId: listing.sellerId,
        amount: offer.amount.toString(),
        commission: commission.toString(),
        totalAmount: totalAmount.toString(),
      },
      customer_email: session.user.email || undefined,
    })

    // Update payment with Stripe session ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripeSessionId: stripeSession.id,
      }
    })

    return NextResponse.json({
      sessionId: stripeSession.id,
      url: stripeSession.url,
      paymentId: payment.id,
      amount: offer.amount,
      commission,
      totalAmount,
    })

  } catch (error) {
    console.error('Error creating payment session:', error)
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
