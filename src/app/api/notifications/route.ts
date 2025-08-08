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

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })

    return NextResponse.json({ notifications })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
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
    const { title, message, type = 'INFO', userId } = body

    if (!title || !message || !userId) {
      return NextResponse.json(
        { error: 'Title, message, and userId are required' },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId,
      }
    })

    return NextResponse.json({ notification }, { status: 201 })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
