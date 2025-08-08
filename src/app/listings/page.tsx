'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils'
import { Package, User, DollarSign, Eye } from 'lucide-react'
import Link from 'next/link'

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
  createdAt: string
  seller: {
    id: string
    name: string
  }
  _count: {
    offers: number
  }
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings')
      if (response.ok) {
        const data = await response.json()
        setListings(data.listings)
      } else {
        setError('Failed to fetch listings')
      }
    } catch (error) {
      setError('An error occurred while fetching listings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading listings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchListings} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
              <span className="text-xl font-bold text-gray-900">LuxBID</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/listings" className="text-gray-900 font-medium">
                Browse Items
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                Profile
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/listings/create">
                <Button>List Item</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Listings Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Luxury Items</h1>
          <p className="text-gray-600">Discover exclusive luxury watches, handbags, and jewelry</p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600">Be the first to list a luxury item!</p>
            <Link href="/listings/create">
              <Button className="mt-4">Create Listing</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100">
                  {listing.images ? (
                    <img
                      src={JSON.parse(listing.images)[0] || '/placeholder.jpg'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {listing.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      listing.status === 'SOLD' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {listing.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{listing.seller.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatPrice(listing.askingPrice)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {listing._count.offers} offers
                    </span>
                    <Link href={`/listings/${listing.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
