'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageUpload } from '@/components/ui/image-upload'
import { useAuth } from '@/hooks/useAuth'
import { Toast } from '@/components/ui/toast'

interface CreateListingForm {
  title: string
  description: string
  category: 'WATCH' | 'BAG' | 'JEWELRY'
  brand: string
  model: string
  year: string
  condition: 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR'
  startingPrice: string
  reservePrice: string
  endDate: string
  images: string[]
}

export default function CreateListingPage() {
  const router = useRouter()
  const { session, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const [formData, setFormData] = useState<CreateListingForm>({
    title: '',
    description: '',
    category: 'WATCH',
    brand: '',
    model: '',
    year: '',
    condition: 'EXCELLENT',
    startingPrice: '',
    reservePrice: '',
    endDate: '',
    images: []
  })

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  if (session?.user?.role !== 'SELLER') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="container mx-auto">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">Only sellers can create listings.</p>
            <Button onClick={() => router.push('/listings')}>
              Back to Listings
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImagesUploaded = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.images.length === 0) {
      setError('Please upload at least one image')
      return
    }

    if (!formData.title || !formData.description || !formData.startingPrice) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startingPrice: parseFloat(formData.startingPrice),
          reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : undefined,
          year: formData.year ? parseInt(formData.year) : undefined,
          endDate: new Date(formData.endDate).toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create listing')
      }

      setToast({ message: 'Listing created successfully!', type: 'success' })
      setTimeout(() => {
        router.push(`/listings/${data.listing.id}`)
      }, 1500)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create listing'
      setError(errorMessage)
      setToast({ message: errorMessage, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
            <p className="text-gray-600">List your luxury item for auction</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide the essential details about your item
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Rolex Submariner Date 2020"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of your item..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="WATCH">Watches</option>
                      <option value="BAG">Bags</option>
                      <option value="JEWELRY">Jewelry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition *
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="NEW">New</option>
                      <option value="EXCELLENT">Excellent</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Item Details */}
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
                <CardDescription>
                  Additional information about your item
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <Input
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="e.g., Rolex"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <Input
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="e.g., Submariner Date"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <Input
                      name="year"
                      type="number"
                      value={formData.year}
                      onChange={handleInputChange}
                      placeholder="e.g., 2020"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Duration</CardTitle>
                <CardDescription>
                  Set your starting price and auction duration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Starting Price *
                    </label>
                    <Input
                      name="startingPrice"
                      type="number"
                      value={formData.startingPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reserve Price (Optional)
                    </label>
                    <Input
                      name="reservePrice"
                      type="number"
                      value={formData.reservePrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <Input
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
                <CardDescription>
                  Upload high-quality images of your item (minimum 1, maximum 10)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onImagesUploaded={handleImagesUploaded}
                  maxImages={10}
                />
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/listings')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || formData.images.length === 0}
              >
                {loading ? 'Creating Listing...' : 'Create Listing'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
