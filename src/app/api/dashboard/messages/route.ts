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

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            listing: {
              sellerId: userId
            }
          },
          {
            senderId: userId
          }
        ]
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        sender: {
          select: {
            name: true
          }
        },
        listing: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json({ messages })

  } catch (error) {
    console.error('Error fetching recent messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent messages' },
      { status: 500 }
    )
  }
}
