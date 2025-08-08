'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Flag, 
  CheckCircle, 
  XCircle,
  Ban,
  Unlock
} from 'lucide-react';

interface FlaggedItem {
  id: string;
  type: 'listing' | 'user' | 'review';
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  item: {
    id: string;
    title?: string;
    name?: string;
    email?: string;
  };
}

interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  reporter: {
    name: string;
    email: string;
  };
  reportedUser: {
    name: string;
    email: string;
  };
}

export default function AdminPage() {
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>([]);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [flaggedResponse, reportsResponse] = await Promise.all([
        fetch('/api/admin/flagged-items'),
        fetch('/api/admin/user-reports')
      ]);

      if (flaggedResponse.ok) {
        const flaggedData = await flaggedResponse.json();
        setFlaggedItems(flaggedData);
      }

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setUserReports(reportsData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (itemId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/review/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error reviewing item:', error);
    }
  };

  const handleUserAction = async (userId: string, action: 'ban' | 'unban') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error handling user action:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Admin Access
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flagged Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Flagged Items ({flaggedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {flaggedItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No flagged items to review
              </p>
            ) : (
              <div className="space-y-4">
                {flaggedItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">
                        {item.type === 'listing' ? item.item.title : item.item.name}
                      </h3>
                      <Badge variant={item.status === 'pending' ? 'destructive' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.reason}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReview(item.id, 'approve')}
                        disabled={item.status !== 'pending'}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReview(item.id, 'reject')}
                        disabled={item.status !== 'pending'}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Reports ({userReports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userReports.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No user reports to review
              </p>
            ) : (
              <div className="space-y-4">
                {userReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{report.reportedUser.name}</h3>
                      <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'}>
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Reported by: {report.reporter.name}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">{report.reason}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUserAction(report.reportedUserId, 'ban')}
                        disabled={report.status !== 'pending'}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Ban User
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction(report.reportedUserId, 'unban')}
                        disabled={report.status !== 'pending'}
                      >
                        <Unlock className="w-4 h-4 mr-1" />
                        Unban User
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
