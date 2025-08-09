import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createOfferSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  amount: z.number().positive("Amount must be positive"),
  message: z.string().optional(),
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

    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')

    const where: Record<string, unknown> = {}
    
    if (listingId) {
      where.listingId = listingId
    }

    // Users can see offers they made or received on their listings
    where.OR = [
      { buyerId: session.user.id }, // Offers user made
      { listing: { sellerId: session.user.id } } // Offers on user's listings
    ]

    const offers = await prisma.offer.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            askingPrice: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ offers })
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
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

    // In unified system, any authenticated user can make offers

    const body = await request.json()
    const { listingId, amount, message } = createOfferSchema.parse(body)

    // Check if listing exists and is active
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Listing is not active' },
        { status: 400 }
      )
    }

    if (listing.sellerId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot make offers on your own listings' },
        { status: 400 }
      )
    }

    // Check if user already made an offer on this listing
    const existingOffer = await prisma.offer.findFirst({
      where: {
        listingId,
        buyerId: session.user.id,
        status: 'PENDING'
      }
    })

    if (existingOffer) {
      return NextResponse.json(
        { error: 'You have already made an offer on this listing' },
        { status: 400 }
      )
    }

    const offer = await prisma.offer.create({
      data: {
        amount,
        message,
        buyerId: session.user.id,
        listingId,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            askingPrice: true,
          }
        }
      }
    })

    return NextResponse.json({ offer }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating offer:', error)
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    )
  }
}
