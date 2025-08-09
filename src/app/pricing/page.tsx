'use client'

import { useState } from 'react'
import { useI18n } from '@/components/providers/I18nProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Crown, Diamond, Star, Zap } from 'lucide-react'
import { PRICING_TIERS, AUTHENTICATION_SERVICES } from '@/lib/pricing'

export default function PricingPage() {
  const { t } = useI18n()
  const [selectedPlan, setSelectedPlan] = useState<string>('premium')

  const formatPrice = (price: number) => {
    return `€${(price / 100).toFixed(0)}`
  }

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'basic': return <Star className="w-6 h-6 text-gray-500" />
      case 'premium': return <Zap className="w-6 h-6 text-blue-500" />
      case 'vip': return <Crown className="w-6 h-6 text-yellow-500" />
      case 'diamond': return <Diamond className="w-6 h-6 text-purple-500" />
      default: return <Star className="w-6 h-6" />
    }
  }

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'basic': return 'border-gray-200'
      case 'premium': return 'border-blue-300 bg-blue-50'
      case 'vip': return 'border-yellow-300 bg-yellow-50'
      case 'diamond': return 'border-purple-300 bg-purple-50'
      default: return 'border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxbid-gold-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-luxbid-gold-600 to-luxbid-dark-700 bg-clip-text text-transparent mb-6">
            Choose Your Luxury Experience
          </h1>
          <p className="text-xl text-luxbid-dark-600 max-w-3xl mx-auto">
            Unlock premium features, reduce commissions, and grow your luxury business with our professional tiers.
          </p>
        </div>

        {/* Membership Tiers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {PRICING_TIERS.map((tier) => (
            <Card 
              key={tier.id}
              className={`relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${getTierColor(tier.id)} ${
                selectedPlan === tier.id ? 'ring-2 ring-luxbid-gold-500' : ''
              }`}
              onClick={() => setSelectedPlan(tier.id)}
            >
              {tier.id === 'vip' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {getTierIcon(tier.id)}
                </div>
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {tier.monthlyFee === 0 ? 'Free Forever' : `${formatPrice(tier.monthlyFee)}/month`}
                </CardDescription>
                <div className="text-3xl font-bold text-luxbid-gold-600 mt-2">
                  {(tier.commissionRate * 100).toFixed(0)}%
                </div>
                <p className="text-sm text-gray-500">commission rate</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full"
                  style={{
                    backgroundColor: tier.id === selectedPlan ? '#B8975A' : 'white',
                    color: tier.id === selectedPlan ? 'white' : '#2D2D2D',
                    border: tier.id === selectedPlan ? 'none' : '2px solid #B8975A',
                    fontWeight: 'bold'
                  }}
                >
                  {tier.monthlyFee === 0 ? 'Get Started Free' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Authentication Services */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-luxbid-dark-800 mb-4">
              Authentication Services
            </h2>
            <p className="text-xl text-luxbid-dark-600">
              Build trust with professional authentication and certification
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(AUTHENTICATION_SERVICES).map(([key, service]) => (
              <Card key={key} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <CardDescription>{service.turnaround}</CardDescription>
                  <div className="text-2xl font-bold text-luxbid-gold-600">
                    {formatPrice(service.price)}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    style={{
                      border: '2px solid #B8975A',
                      color: '#2D2D2D',
                      fontWeight: 'bold'
                    }}
                  >
                    Request Service
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-luxbid-gold-600 to-luxbid-dark-700 text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Scale Your Luxury Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of luxury dealers who trust LuxBID for their high-value transactions
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg"
              style={{
                backgroundColor: 'white',
                color: '#2D2D2D',
                fontWeight: 'bold',
                padding: '16px 32px'
              }}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline"
              size="lg"
              style={{
                border: '2px solid white',
                color: 'white',
                fontWeight: 'bold',
                padding: '16px 32px'
              }}
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
