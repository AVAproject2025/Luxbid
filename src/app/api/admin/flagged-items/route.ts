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

    // For now, we'll return mock data since we haven't implemented the flagging system yet
    // In a real implementation, you'd have a FlaggedItem model in your schema
    
    const mockFlaggedItems = [
      {
        id: '1',
        type: 'LISTING',
        reason: 'Inappropriate content',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        item: {
          id: 'listing-1',
          title: 'Rolex Submariner Watch'
        },
        reporter: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      },
      {
        id: '2',
        type: 'MESSAGE',
        reason: 'Spam',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        item: {
          id: 'message-1',
          content: 'Check out this amazing deal!'
        },
        reporter: {
          name: 'Jane Smith',
          email: 'jane@example.com'
        }
      }
    ]

    return NextResponse.json({ items: mockFlaggedItems })

  } catch (error) {
    console.error('Error fetching flagged items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flagged items' },
      { status: 500 }
    )
  }
}
