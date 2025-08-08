'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice, formatDate } from '@/lib/utils'
import { 
  Package, 
  User, 
  DollarSign
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
  status: string
  createdAt: string
  buyer: {
    id: string
    name: string
  }
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const { session, isAuthenticated } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingOffer, setSubmittingOffer] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')
  const [offerMessage, setOfferMessage] = useState('')

  const fetchListingData = useCallback(async () => {
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
  }, [params.id])

  useEffect(() => {
    fetchListingData()
  }, [fetchListingData])

  const handleSubmitOffer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isAuthenticated) return

    setSubmittingOffer(true)
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: params.id,
          amount: parseFloat(offerAmount),
          message: offerMessage || undefined,
        }),
      })

      if (response.ok) {
        setOfferAmount('')
        setOfferMessage('')
        fetchListingData() // Refresh data
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to submit offer')
      }
    } catch (error) {
      console.error('Error submitting offer:', error)
      alert('Failed to submit offer')
    } finally {
      setSubmittingOffer(false)
    }
  }

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const response = await fetch(`/api/offers/${offerId}/accept`, {
        method: 'PATCH',
      })

      if (response.ok) {
        fetchListingData() // Refresh data
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to accept offer')
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(listing.askingPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {listing._count.offers} offers
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Offers Section */}
          <div className="space-y-6">
            {isAuthenticated && !isSeller && listing.status === 'ACTIVE' && !userOffer && (
              <Card>
                <CardHeader>
                  <CardTitle>Make an Offer</CardTitle>
                  <CardDescription>
                    Submit a private offer for this item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitOffer} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Offer Amount *
                      </label>
                      <Input
                        type="number"
                        value={offerAmount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOfferAmount(e.target.value)}
                        placeholder="0.00"
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
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOfferMessage(e.target.value)}
                        placeholder="Add a message to your offer..."
                        rows={3}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submittingOffer}
                      className="w-full"
                    >
                      {submittingOffer ? 'Submitting...' : 'Submit Offer'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {isSeller && offers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Offers Received</CardTitle>
                  <CardDescription>
                    {offers.length} offer{offers.length !== 1 ? 's' : ''} received
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {offers.map((offer) => (
                      <div
                        key={offer.id}
                        className={`p-4 border rounded-lg ${
                          offer.status === 'ACCEPTED'
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{offer.buyer.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-green-600">
                              {formatPrice(offer.amount)}
                            </span>
                          </div>
                        </div>
                        {offer.message && (
                          <p className="text-sm text-gray-600 mb-2">
                            {offer.message}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDate(new Date(offer.createdAt))}
                          </span>
                          {offer.status === 'PENDING' && (
                            <Button
                              size="sm"
                              onClick={() => handleAcceptOffer(offer.id)}
                            >
                              Accept Offer
                            </Button>
                          )}
                          {offer.status === 'ACCEPTED' && (
                            <span className="text-sm font-medium text-green-600">
                              Accepted
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {userOffer && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Offer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`p-4 border rounded-lg ${
                    userOffer.status === 'ACCEPTED'
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Your Offer</span>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-green-600">
                          {formatPrice(userOffer.amount)}
                        </span>
                      </div>
                    </div>
                    {userOffer.message && (
                      <p className="text-sm text-gray-600 mb-2">
                        {userOffer.message}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDate(new Date(userOffer.createdAt))}
                      </span>
                      <span className={`text-sm font-medium ${
                        userOffer.status === 'ACCEPTED'
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}>
                        {userOffer.status === 'ACCEPTED' ? 'Accepted' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
