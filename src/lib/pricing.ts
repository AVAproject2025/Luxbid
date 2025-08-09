// LuxBID Pricing & Commission System

export interface PricingTier {
  id: string
  name: string
  monthlyFee: number
  commissionRate: number
  features: string[]
  maxListings: number
  priority: number
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyFee: 0,
    commissionRate: 0.08, // 8%
    maxListings: 5,
    priority: 1,
    features: [
      'Up to 5 listings',
      '8% commission on sales', 
      'Basic support',
      'Standard listing visibility'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyFee: 4900, // €49
    commissionRate: 0.05, // 5%
    maxListings: 25,
    priority: 2,
    features: [
      'Up to 25 listings',
      '5% commission on sales',
      'Verified seller badge',
      'Priority support',
      'Featured listings',
      'Analytics dashboard'
    ]
  },
  {
    id: 'vip',
    name: 'VIP', 
    monthlyFee: 9900, // €99
    commissionRate: 0.03, // 3%
    maxListings: 100,
    priority: 3,
    features: [
      'Unlimited listings',
      '3% commission on sales',
      'Dedicated luxury concierge',
      '24/7 premium support',
      'Top placement in searches',
      'Advanced analytics',
      'Authentication assistance',
      'Insurance coverage up to €10,000'
    ]
  },
  {
    id: 'diamond',
    name: 'Diamond',
    monthlyFee: 99900, // €999
    commissionRate: 0.02, // 2%
    maxListings: -1, // Unlimited
    priority: 4,
    features: [
      'Unlimited premium listings',
      '2% commission on sales',
      'Personal luxury advisor',
      'White-glove delivery service',
      'Private auction access',
      'Investment portfolio tracking',
      'Tax optimization consulting',
      'Full insurance coverage',
      'Custom API access'
    ]
  }
]

export const AUTHENTICATION_SERVICES = {
  basic: {
    price: 4900, // €49
    name: 'Basic Verification',
    turnaround: '2-3 business days',
    features: ['Photo analysis', 'Brand verification', 'Basic authenticity report']
  },
  expert: {
    price: 14900, // €149  
    name: 'Expert Evaluation',
    turnaround: '1-2 business days',
    features: ['Expert physical inspection', 'Detailed condition report', 'Market valuation', 'Signed certificate']
  },
  blockchain: {
    price: 29900, // €299
    name: 'Blockchain Certificate', 
    turnaround: '3-5 business days',
    features: ['Full expert evaluation', 'Blockchain-secured certificate', 'NFT ownership proof', 'Lifetime authenticity guarantee']
  }
}

export function calculateCommission(salePrice: number, userTier: string): number {
  const tier = PRICING_TIERS.find(t => t.id === userTier) || PRICING_TIERS[0]
  return Math.round(salePrice * tier.commissionRate)
}

export function calculateNetProfit(salePrice: number, userTier: string): number {
  const commission = calculateCommission(salePrice, userTier)
  return salePrice - commission
}

export function getUserTierFeatures(userTier: string): string[] {
  const tier = PRICING_TIERS.find(t => t.id === userTier) || PRICING_TIERS[0]
  return tier.features
}

export function canCreateListing(userTier: string, currentListings: number): boolean {
  const tier = PRICING_TIERS.find(t => t.id === userTier) || PRICING_TIERS[0]
  if (tier.maxListings === -1) return true // Unlimited
  return currentListings < tier.maxListings
}

export function getListingPriority(userTier: string): number {
  const tier = PRICING_TIERS.find(t => t.id === userTier) || PRICING_TIERS[0]
  return tier.priority
}
