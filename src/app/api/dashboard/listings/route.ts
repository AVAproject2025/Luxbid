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

    const listings = await prisma.listing.findMany({
      where: { sellerId: userId },
      select: {
        id: true,
        title: true,
        askingPrice: true,
        status: true,
        endDate: true,
        _count: {
          select: {
            offers: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json({ listings })

  } catch (error) {
    console.error('Error fetching recent listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent listings' },
      { status: 500 }
    )
  }
}
