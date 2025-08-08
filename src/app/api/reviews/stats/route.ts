import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get all reviews for user's listings
    const reviews = await prisma.review.findMany({
      where: {
        listing: {
          sellerId: userId
        }
      },
      select: {
        rating: true
      }
    })

    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0

    // Calculate rating distribution
    const ratingDistribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }

    reviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++
    })

    return NextResponse.json({
      averageRating,
      totalReviews,
      ratingDistribution
    })

  } catch (error) {
    console.error('Error fetching review stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review stats' },
      { status: 500 }
    )
  }
}
