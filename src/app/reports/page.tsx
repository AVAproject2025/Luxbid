'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice, formatDate } from '@/lib/utils'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Download,
  Calendar,
  Filter
} from 'lucide-react'

interface ReportData {
  totalRevenue: number
  totalListings: number
  totalBids: number
  totalUsers: number
  averageListingPrice: number
  conversionRate: number
  monthlyRevenue: {
    month: string
    revenue: number
  }[]
  topCategories: {
    category: string
    count: number
    revenue: number
  }[]
  recentTransactions: {
    id: string
    amount: number
    type: string
    status: string
    createdAt: string
  }[]
}

export default function ReportsPage() {
  const router = useRouter()
  const { session, isAuthenticated } = useAuth()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchReportData()
  }, [isAuthenticated, router, dateRange])

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/reports?range=${dateRange}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/reports/export?format=${format}&range=${dateRange}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `luxbid-report-${dateRange}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="container mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive insights into your platform performance</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button
                onClick={() => exportReport('csv')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {reportData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(reportData.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalListings}</div>
                <p className="text-xs text-muted-foreground">
                  {reportData.averageListingPrice ? `Avg: ${formatPrice(reportData.averageListingPrice)}` : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalBids}</div>
                <p className="text-xs text-muted-foreground">
                  {reportData.conversionRate ? `${reportData.conversionRate.toFixed(1)}% conversion` : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last period
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts and Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Monthly Revenue
              </CardTitle>
              <CardDescription>
                Revenue trends over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportData?.monthlyRevenue && reportData.monthlyRevenue.length > 0 ? (
                <div className="space-y-4">
                  {reportData.monthlyRevenue.map((item) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.month}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(item.revenue / Math.max(...reportData.monthlyRevenue.map(m => m.revenue))) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">{formatPrice(item.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No revenue data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Top Categories
              </CardTitle>
              <CardDescription>
                Performance by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportData?.topCategories && reportData.topCategories.length > 0 ? (
                <div className="space-y-4">
                  {reportData.topCategories.map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-gray-500">{category.count} listings</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(category.revenue)}</p>
                        <p className="text-sm text-gray-500">
                          {((category.revenue / reportData.totalRevenue) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No category data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Latest financial activity on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportData?.recentTransactions && reportData.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {reportData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{transaction.type}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(new Date(transaction.createdAt))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(transaction.amount)}</p>
                      <p className="text-sm text-gray-500 capitalize">{transaction.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent transactions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
