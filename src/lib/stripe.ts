import Stripe from 'stripe'

// Allow build to proceed without Stripe key (will be set in Vercel env vars)
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

export const COMMISSION_RATE = 0.05 // 5% commission

export function calculateCommission(amount: number): number {
  return Math.round(amount * COMMISSION_RATE * 100) / 100
}

export function calculateTotalWithCommission(amount: number): number {
  const commission = calculateCommission(amount)
  return amount + commission
}
