import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { sessionId } = await params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)

    if (!stripeSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get payment record
    const payment = await prisma.payment.findFirst({
      where: {
        stripeSessionId: sessionId,
        buyerId: session.user.id,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      sessionId: stripeSession.id,
      amount: payment.amount,
      commission: payment.commission,
      totalAmount: payment.amount + payment.commission,
      listingTitle: payment.listing.title,
      paymentId: payment.id,
      status: payment.status,
      createdAt: payment.createdAt,
    })

  } catch (error) {
    console.error('Error fetching session details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session details' },
      { status: 500 }
    )
  }
}
