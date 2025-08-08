import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createReviewSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().optional(),
})

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

    const reviews = await prisma.review.findMany({
      where: {
        listing: {
          sellerId: userId
        }
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ reviews })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { listingId, rating, comment } = createReviewSchema.parse(body)

    // Check if listing exists and user has purchased it
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        payments: {
          where: {
            buyerId: session.user.id,
            status: 'COMPLETED'
          }
        }
      }
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.payments.length === 0) {
      return NextResponse.json(
        { error: 'You can only review items you have purchased' },
        { status: 403 }
      )
    }

    // Check if user already reviewed this listing
    const existingReview = await prisma.review.findFirst({
      where: {
        listingId,
        reviewerId: session.user.id
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this listing' },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        reviewerId: session.user.id,
        listingId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        reviewer: review.reviewer,
        listing: review.listing
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
