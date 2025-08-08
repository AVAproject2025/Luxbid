import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // Get the offer
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            sellerId: true,
            status: true,
            title: true,
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Check if the current user is the seller of the listing
    if (offer.listing.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only accept offers on your own listings' },
        { status: 403 }
      )
    }

    if (offer.listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Listing is not active' },
        { status: 400 }
      )
    }

    if (offer.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Offer is not pending' },
        { status: 400 }
      )
    }

    // Accept the offer and reject all other offers on this listing
    await prisma.$transaction([
      // Accept the selected offer
      prisma.offer.update({
        where: { id },
        data: { status: 'ACCEPTED' }
      }),
      // Reject all other pending offers on this listing
      prisma.offer.updateMany({
        where: {
          listingId: offer.listing.id,
          id: { not: id },
          status: 'PENDING'
        },
        data: { status: 'REJECTED' }
      }),
      // Update listing status to SOLD
      prisma.listing.update({
        where: { id: offer.listing.id },
        data: { status: 'SOLD' }
      })
    ])

    // Create notifications
    await prisma.notification.createMany({
      data: [
        {
          title: 'Offer Accepted',
          message: `Your offer of $${offer.amount} for "${offer.listing.title}" has been accepted!`,
          type: 'SUCCESS',
          userId: offer.buyerId,
        },
        {
          title: 'Listing Sold',
          message: `Your listing "${offer.listing.title}" has been sold for $${offer.amount}`,
          type: 'SUCCESS',
          userId: offer.listing.sellerId,
        }
      ]
    })

    return NextResponse.json({ 
      success: true,
      message: 'Offer accepted successfully'
    })

  } catch (error) {
    console.error('Error accepting offer:', error)
    return NextResponse.json(
      { error: 'Failed to accept offer' },
      { status: 500 }
    )
  }
}
