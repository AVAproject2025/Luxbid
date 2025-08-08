'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice, formatDate } from '@/lib/utils'
import { 
  Package, 
  User, 
  DollarSign, 
  MessageSquare,
  Eye
} from 'lucide-react'

interface Listing {
  id: string
  title: string
  description: string
  category: string
  brand?: string
  model?: string
  year?: number
  condition: string
  askingPrice: number
  images: string
  status: string
  endDate?: string
  createdAt: string
  seller: {
    id: string
    name: string
  }
  _count: {
    offers: number
  }
}

interface Offer {
  id: string
  amount: number
  message?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  buyer: {
    id: string
    name: string
  }
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { session, isAuthenticated } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingOffer, setSubmittingOffer] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')
  const [offerMessage, setOfferMessage] = useState('')

  useEffect(() => {
    fetchListingData()
  }, [params.id])

  const fetchListingData = async () => {
    try {
      const [listingRes, offersRes] = await Promise.all([
        fetch(`/api/listings/${params.id}`),
        fetch(`/api/offers?listingId=${params.id}`)
      ])

      if (listingRes.ok) {
        const listingData = await listingRes.json()
        setListing(listingData.listing)
      }

      if (offersRes.ok) {
        const offersData = await offersRes.json()
        setOffers(offersData.offers)
      }
    } catch (error) {
      console.error('Error fetching listing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitOffer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isAuthenticated || !listing) return

    const amount = parseFloat(offerAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    try {
      setSubmittingOffer(true)
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing.id,
          amount,
          message: offerMessage.trim() || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setOffers(prev => [data.offer, ...prev])
        setOfferAmount('')
        setOfferMessage('')
        alert('Offer submitted successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit offer')
      }
    } catch (error) {
      console.error('Error submitting offer:', error)
      alert('Failed to submit offer')
    } finally {
      setSubmittingOffer(false)
    }
  }

  const handleAcceptOffer = async (offerId: string) => {
    if (!confirm('Are you sure you want to accept this offer?')) return

    try {
      const response = await fetch(`/api/offers/${offerId}/accept`, {
        method: 'PATCH',
      })

      if (response.ok) {
        alert('Offer accepted successfully!')
        fetchListingData() // Refresh data
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to accept offer')
      }
    } catch (error) {
      console.error('Error accepting offer:', error)
      alert('Failed to accept offer')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="container mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading listing...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="container mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
            <p className="text-gray-600">The listing you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
      </div>
    )
  }

  const images = listing.images ? JSON.parse(listing.images) : []
  const isSeller = session?.user?.id === listing.seller.id
  const userOffer = offers.find(offer => offer.buyer.id === session?.user?.id)
  const acceptedOffer = offers.find(offer => offer.status === 'ACCEPTED')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Listing Details */}
          <div className="space-y-6">
            {/* Images */}
            {images.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <img
                    src={images[0]}
                    alt={listing.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Listing Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {listing.title}
                </CardTitle>
                <CardDescription>
                  Listed by {listing.seller.name} on {formatDate(new Date(listing.createdAt))}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <p className="text-gray-900">{listing.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition
                    </label>
                    <p className="text-gray-900">{listing.condition}</p>
                  </div>
                  {listing.brand && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand
                      </label>
                      <p className="text-gray-900">{listing.brand}</p>
                    </div>
                  )}
                  {listing.model && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model
                      </label>
                      <p className="text-gray-900">{listing.model}</p>
                    </div>
                  )}
                  {listing.year && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      <p className="text-gray-900">{listing.year}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-gray-900">{listing.description}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Asking Price</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(listing.askingPrice)}
                    </span>
                  </div>
                </div>

                {listing.status === 'SOLD' && acceptedOffer && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-800">Sold for {formatPrice(acceptedOffer.amount)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Offers Section */}
          <div className="space-y-6">
            {/* Make Offer */}
            {isAuthenticated && !isSeller && listing.status === 'ACTIVE' && !userOffer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Make a Private Offer
                  </CardTitle>
                  <CardDescription>
                    Submit a private offer to the seller. Only the seller will see your offer.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitOffer} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Offer Amount
                      </label>
                      <Input
                        type="number"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        placeholder="Enter your offer amount"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message (Optional)
                      </label>
                      <Textarea
                        value={offerMessage}
                        onChange={(e) => setOfferMessage(e.target.value)}
                        placeholder="Add a message to your offer..."
                        rows={3}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submittingOffer || !offerAmount}
                      className="w-full"
                    >
                      {submittingOffer ? 'Submitting...' : 'Submit Offer'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* User's Offer */}
            {userOffer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Your Offer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Amount:</span>
                      <span className="font-bold text-blue-600">{formatPrice(userOffer.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userOffer.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        userOffer.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {userOffer.status}
                      </span>
                    </div>
                    {userOffer.message && (
                      <div>
                        <span className="font-medium">Message:</span>
                        <p className="text-gray-600 mt-1">{userOffer.message}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seller's View - All Offers */}
            {isSeller && listing.status === 'ACTIVE' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Private Offers ({offers.filter(o => o.status === 'PENDING').length})
                  </CardTitle>
                  <CardDescription>
                    Review and accept offers from buyers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {offers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No offers yet</p>
                  ) : (
                    <div className="space-y-4">
                      {offers.map((offer) => (
                        <div key={offer.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{offer.buyer.name}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              offer.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {offer.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-lg">{formatPrice(offer.amount)}</p>
                              {offer.message && (
                                <p className="text-sm text-gray-600 mt-1">{offer.message}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(new Date(offer.createdAt))}
                              </p>
                            </div>
                            {offer.status === 'PENDING' && (
                              <Button
                                onClick={() => handleAcceptOffer(offer.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Accept Offer
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
