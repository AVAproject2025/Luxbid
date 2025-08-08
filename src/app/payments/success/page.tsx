'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, CreditCard, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface PaymentSuccessData {
  sessionId: string
  amount: number
  commission: number
  totalAmount: number
  listingTitle: string
  paymentId: string
}

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { session, isAuthenticated } = useAuth()
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null)
  const [loading, setLoading] = useState(true)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!sessionId) {
      router.push('/listings')
      return
    }

    // Fetch payment details
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`/api/payments/session/${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setPaymentData(data)
        } else {
          console.error('Failed to fetch payment details')
        }
      } catch (error) {
        console.error('Error fetching payment details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentDetails()
  }, [sessionId, isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully. You&apos;ll receive a confirmation email shortly.
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
          </div>

          {/* Payment Details */}
          {paymentData && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Payment Details
                </CardTitle>
                <CardDescription>
                  Transaction completed successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item
                    </label>
                    <p className="text-gray-900 font-medium">{paymentData.listingTitle}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment ID
                    </label>
                    <p className="text-gray-900 font-mono text-sm">{paymentData.paymentId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <p className="text-gray-900 font-medium">${paymentData.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commission
                    </label>
                    <p className="text-gray-900 font-medium">${paymentData.commission.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Paid</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${paymentData.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>
                Here's what happens after your successful payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Payment Confirmation</h3>
                    <p className="text-sm text-gray-600">
                      You'll receive a confirmation email with your payment details and receipt.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Seller Notification</h3>
                    <p className="text-sm text-gray-600">
                      The seller will be notified of your payment and will contact you to arrange delivery.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Item Delivery</h3>
                    <p className="text-sm text-gray-600">
                      Once the seller confirms, you can arrange pickup or delivery of your item.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              View Dashboard
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/listings')}
              className="flex items-center gap-2"
            >
              Browse More Items
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
