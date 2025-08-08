import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const error = err as Error;
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { offerId, listingId, buyerId } = paymentIntent.metadata;

  if (!offerId || !listingId || !buyerId) {
    console.error('Missing metadata in payment intent');
    return;
  }

  try {
    // Update offer status
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'ACCEPTED' },
    });

    // Update listing status
    await prisma.listing.update({
      where: { id: listingId },
      data: { status: 'SOLD' },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'COMPLETED',
        stripePaymentIntentId: paymentIntent.id,
        commission: (paymentIntent.amount / 100) * 0.05, // 5% commission
        buyerId,
        listingId,
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        type: 'COMMISSION',
        amount: (paymentIntent.amount / 100) * 0.05,
        currency: paymentIntent.currency,
        status: 'COMPLETED',
        description: 'Platform commission',
        stripePaymentIntentId: paymentIntent.id,
        userId: buyerId,
        listingId,
      },
    });

    // Create notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: buyerId,
          title: 'Payment Successful',
          message: 'Your payment has been processed successfully.',
          type: 'SUCCESS',
        },
        {
          userId: buyerId,
          title: 'Item Purchased',
          message: 'You have successfully purchased the item.',
          type: 'SUCCESS',
        },
      ],
    });

    console.log(`Payment successful for offer ${offerId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { offerId, buyerId } = paymentIntent.metadata;

  if (!offerId || !buyerId) {
    console.error('Missing metadata in payment intent');
    return;
  }

  try {
    // Update offer status
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'PENDING' },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: buyerId,
        title: 'Payment Failed',
        message: 'Your payment has failed. Please try again.',
        type: 'ERROR',
      },
    });

    console.log(`Payment failed for offer ${offerId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { offerId, listingId, buyerId } = session.metadata || {};

  if (!offerId || !listingId || !buyerId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  try {
    // Update offer status
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'ACCEPTED' },
    });

    // Update listing status
    await prisma.listing.update({
      where: { id: listingId },
      data: { status: 'SOLD' },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        amount: (session.amount_total || 0) / 100,
        currency: session.currency || 'usd',
        status: 'COMPLETED',
        stripeSessionId: session.id,
        commission: ((session.amount_total || 0) / 100) * 0.05,
        buyerId,
        listingId,
      },
    });

    console.log(`Checkout completed for offer ${offerId}`);
  } catch (error) {
    console.error('Error handling checkout complete:', error);
  }
}
