import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
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
