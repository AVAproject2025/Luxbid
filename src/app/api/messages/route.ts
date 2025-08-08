import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createMessageSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  content: z.string().min(1, "Message content is required").max(1000, "Message too long"),
})

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
    const { listingId, content } = createMessageSchema.parse(body)

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        sellerId: true,
        status: true
      }
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot send messages to inactive listings' },
        { status: 400 }
      )
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        listingId,
      },
      include: {
        sender: {
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
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        sender: message.sender,
        listing: message.listing
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
