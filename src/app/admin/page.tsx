'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatPrice } from '@/lib/utils'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Ban,
  UserCheck,
  Flag,
  Settings
} from 'lucide-react'

interface FlaggedItem {
  id: string
  type: 'LISTING' | 'USER' | 'MESSAGE' | 'REVIEW'
  reason: string
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED'
  createdAt: string
  item: {
    id: string
    title?: string
    content?: string
    name?: string
  }
  reporter: {
    name: string
    email: string
  }
}

interface UserReport {
  id: string
  userId: string
  reason: string
  status: 'PENDING' | 'REVIEWED' | 'BANNED'
  createdAt: string
  user: {
    name: string
    email: string
  }
  reporter: {
    name: string
    email: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const { session, isAuthenticated } = useAuth()
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>([])
  const [userReports, setUserReports] = useState<UserReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<FlaggedItem | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Check if user is admin
    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchAdminData()
  }, [isAuthenticated, router, session])

  const fetchAdminData = async () => {
    try {
      const [flaggedRes, usersRes] = await Promise.all([
        fetch('/api/admin/flagged-items'),
        fetch('/api/admin/user-reports')
      ])

      if (flaggedRes.ok) {
        const flaggedData = await flaggedRes.json()
        setFlaggedItems(flaggedData.items)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUserReports(usersData.reports)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (itemId: string, action: 'approve' | 'reject' | 'ban') => {
    try {
      const response = await fetch(`/api/admin/review/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        fetchAdminData() // Refresh data
        setSelectedItem(null)
      }
    } catch (error) {
      console.error('Error reviewing item:', error)
    }
  }

  const handleUserAction = async (userId: string, action: 'ban' | 'unban') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'PATCH'
      })

      if (response.ok) {
        fetchAdminData() // Refresh data
      }
    } catch (error) {
      console.error('Error handling user action:', error)
    }
  }

  if (!isAuthenticated || session?.user?.role !== 'ADMIN') {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="container mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin panel...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Moderate content and manage platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Items</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flaggedItems.filter(item => item.status === 'PENDING').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userReports.filter(report => report.status === 'PENDING').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userReports.filter(report => report.status === 'BANNED').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Total banned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flaggedItems.filter(item => item.status === 'RESOLVED').length}
              </div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Flagged Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Flagged Items
              </CardTitle>
              <CardDescription>
                Content reported by users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No flagged items</p>
                  </div>
                ) : (
                  flaggedItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.status}
                          </span>
                          <span className="text-sm text-gray-500 capitalize">
                            {item.type.toLowerCase()}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <h4 className="font-medium mb-1">
                        {item.item.title || item.item.content || item.item.name}
                      </h4>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Reason: {item.reason}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Reported by: {item.reporter.name}</span>
                        <span>{formatDate(new Date(item.createdAt))}</span>
                      </div>

                      {item.status === 'PENDING' && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleReview(item.id, 'approve')}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(item.id, 'reject')}
                            className="flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                User Reports
              </CardTitle>
              <CardDescription>
                Users reported by other users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No user reports</p>
                  </div>
                ) : (
                  userReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            report.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="font-medium mb-1">
                        {report.user.name} ({report.user.email})
                      </h4>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Reason: {report.reason}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Reported by: {report.reporter.name}</span>
                        <span>{formatDate(new Date(report.createdAt))}</span>
                      </div>

                      {report.status === 'PENDING' && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUserAction(report.userId, 'ban')}
                            className="flex items-center gap-1"
                          >
                            <Ban className="w-3 h-3" />
                            Ban User
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(report.id, 'approve')}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Dismiss
                          </Button>
                        </div>
                      )}

                      {report.status === 'BANNED' && (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(report.userId, 'unban')}
                            className="flex items-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" />
                            Unban User
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
