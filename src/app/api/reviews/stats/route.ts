import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const stats = await prisma.review.aggregate({
      where: {
        listing: {
          sellerId: session.user.id
        }
      },
      _avg: {
        rating: true
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      averageRating: stats._avg.rating || 0,
      totalReviews: stats._count.id
    })
  } catch (error) {
    console.error('Error fetching review stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review stats' },
      { status: 500 }
    )
  }
}
