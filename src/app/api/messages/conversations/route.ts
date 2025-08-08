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

    // Get all listings where user is involved in conversations
    const listings = await prisma.listing.findMany({
      where: {
        OR: [
          { sellerId: userId },
          {
            messages: {
              some: {
                senderId: userId
              }
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        messages: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            read: true,
            sender: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    const conversations = listings.map(listing => {
      const messages = listing.messages
      const lastMessage = messages[0]
      const unreadCount = messages.filter(msg => 
        msg.senderId !== userId && !msg.read
      ).length

      return {
        listingId: listing.id,
        listingTitle: listing.title,
        lastMessage,
        unreadCount
      }
    }).filter(conv => conv.lastMessage) // Only include conversations with messages

    return NextResponse.json({ conversations })

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
