'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice, formatDate } from '@/lib/utils'

interface Listing {
  id: string
  title: string
  description: string
  category: string
  brand?: string
  model?: string
  year?: number
  condition: string
  startingPrice: number
  currentPrice: number
  images: string
  status: string
  endDate: string
  createdAt: string
  seller: {
    id: string
    name: string
  }
  bids: Array<{
    id: string
    amount: number
    createdAt: string
  }>
  _count: {
    bids: number
  }
}

interface ListingsResponse {
  listings: Listing[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    status: 'ACTIVE',
    page: 1
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })
  const { session } = useAuth()

  const fetchListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: '12',
        status: filters.status,
        ...(filters.category && { category: filters.category })
      })

      const response = await fetch(`/api/listings?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch listings')
      }

      const data: ListingsResponse = await response.json()
      setListings(data.listings)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const getImageUrl = (images: string) => {
    try {
      const imageArray = JSON.parse(images)
      return imageArray[0] || '/placeholder-image.jpg'
    } catch {
      return '/placeholder-image.jpg'
    }
  }

  if (loading && listings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="container mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading listings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Auctions</h1>
              <p className="text-gray-600">Discover luxury items up for auction</p>
            </div>
            {session?.user?.role === 'SELLER' && (
              <Link href="/listings/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Create Listing
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="WATCH">Watches</option>
                <option value="BAG">Bags</option>
                <option value="JEWELRY">Jewelry</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ACTIVE">Active</option>
                <option value="SOLD">Sold</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => fetchListings()} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                <img
                  src={getImageUrl(listing.images)}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.jpg'
                  }}
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
                <CardDescription className="line-clamp-1">
                  {listing.brand} {listing.model}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Current Price</span>
                    <span className="font-semibold text-lg text-green-600">
                      {formatPrice(listing.currentPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Bids: {listing._count.bids}</span>
                    <span>Ends: {formatDate(new Date(listing.endDate))}</span>
                  </div>
                  <div className="pt-2">
                    <Link href={`/listings/${listing.id}`}>
                      <Button className="w-full">
                        {listing.status === 'ACTIVE' ? 'View & Bid' : 'View Details'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === pagination.page ? "default" : "outline"}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && listings.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  )
}
