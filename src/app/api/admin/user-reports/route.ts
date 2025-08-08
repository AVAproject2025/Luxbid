import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // For now, we'll return mock data since we haven't implemented the user reporting system yet
    // In a real implementation, you'd have a UserReport model in your schema
    
    const mockUserReports = [
      {
        id: '1',
        userId: 'user-1',
        reason: 'Suspicious activity',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        user: {
          name: 'Suspicious User',
          email: 'suspicious@example.com'
        },
        reporter: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      },
      {
        id: '2',
        userId: 'user-2',
        reason: 'Inappropriate behavior',
        status: 'BANNED',
        createdAt: new Date().toISOString(),
        user: {
          name: 'Banned User',
          email: 'banned@example.com'
        },
        reporter: {
          name: 'Jane Smith',
          email: 'jane@example.com'
        }
      }
    ]

    return NextResponse.json({ reports: mockUserReports })

  } catch (error) {
    console.error('Error fetching user reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user reports' },
      { status: 500 }
    )
  }
}
