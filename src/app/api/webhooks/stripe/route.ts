import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const { paymentId, listingId, offerId, buyerId, sellerId, amount, commission, totalAmount } = session.metadata

  // Update payment status
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'COMPLETED',
      stripePaymentIntentId: session.payment_intent,
    }
  })

  // Create transaction record
  const transaction = await prisma.transaction.create({
    data: {
      type: 'PAYMENT',
      amount: parseFloat(totalAmount),
      status: 'COMPLETED',
      description: `Payment for listing ${listingId}`,
      stripePaymentIntentId: session.payment_intent,
      userId: buyerId,
      listingId,
    }
  })

  // Link transaction to payment
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      transaction: {
        connect: { id: transaction.id }
      }
    }
  })

  // Update offer status
  if (offerId) {
    await prisma.offer.update({
      where: { id: offerId },
      data: {
        status: 'ACCEPTED',
      }
    })
  }

  // Update listing status
  await prisma.listing.update({
    where: { id: listingId },
    data: {
      status: 'SOLD',
    }
  })

  // Create commission transaction for platform
  await prisma.transaction.create({
    data: {
      type: 'COMMISSION',
      amount: parseFloat(commission),
      status: 'COMPLETED',
      description: `Platform commission for listing ${listingId}`,
      userId: sellerId, // Commission goes to platform (represented by seller for now)
      listingId,
    }
  })

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        title: 'Payment Successful',
        message: `Your payment of $${totalAmount} for ${session.line_items?.data?.[0]?.description || 'the item'} has been processed successfully.`,
        type: 'SUCCESS',
        userId: buyerId,
      },
      {
        title: 'Item Sold',
        message: `Your item has been sold for $${amount}. Payment has been processed.`,
        type: 'SUCCESS',
        userId: sellerId,
      }
    ]
  })
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  // Payment intent succeeded - this is handled by checkout.session.completed
  console.log('Payment intent succeeded:', paymentIntent.id)
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  const { paymentId } = paymentIntent.metadata

  if (paymentId) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'FAILED',
      }
    })

    // Create failed transaction record
    await prisma.transaction.create({
      data: {
        type: 'PAYMENT',
        amount: paymentIntent.amount / 100,
        status: 'FAILED',
        description: 'Payment failed',
        stripePaymentIntentId: paymentIntent.id,
        userId: paymentIntent.metadata?.buyerId || '',
        listingId: paymentIntent.metadata?.listingId || '',
      }
    })
  }
}
