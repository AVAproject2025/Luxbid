'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/components/providers/I18nProvider'

function PaymentSuccessContent() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxbid-gold-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxbid-gold-50 to-white">
      {/* Header is global */}

      {/* Success Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-4">
                {t('payment.success.title')}
              </h1>
              <p className="text-gray-600 mb-6">
                —
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800">
                  <strong>Transaction ID:</strong> {searchParams.get('payment_intent') || 'N/A'}
                </p>
                <p className="text-green-800">
                  <strong>Amount:</strong> ${searchParams.get('amount') || 'N/A'}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Thank you for your purchase! The seller will be notified and you&apos;ll receive the item details shortly.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Details */}
              <div className="border-t pt-6">
                 <h3 className="text-lg font-semibold mb-4">Order Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                     <span className="text-gray-600">Item:</span>
                    <span className="font-medium">Luxury Watch</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-gray-600">Price:</span>
                    <span className="font-medium">${searchParams.get('amount') || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-gray-600">Commission:</span>
                    <span className="font-medium">5%</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                     <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-semibold text-green-600">
                      ${searchParams.get('amount') || '0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                 <h4 className="font-semibold text-blue-900 mb-2">What&apos;s Next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                   <li>• Email confirmation</li>
                   <li>• Seller notified</li>
                   <li>• Contacts shared after commission</li>
                   <li>• Arrange shipping with seller</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full" variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/listings" className="flex-1">
                  <Button className="w-full">
                    <Package className="w-4 h-4 mr-2" />
                    Browse More Items
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-luxbid-gold-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
