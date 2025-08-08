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

    const userId = session.user.id

    const [
      totalListings,
      totalOffers,
      totalRevenue,
      averageRating,
      unreadMessages
    ] = await Promise.all([
      prisma.listing.count({
        where: { sellerId: userId }
      }),
      prisma.offer.count({
        where: { listing: { sellerId: userId } }
      }),
      prisma.payment.aggregate({
        where: { buyerId: userId },
        _sum: { amount: true }
      }),
      prisma.review.aggregate({
        where: { listing: { sellerId: userId } },
        _avg: { rating: true }
      }),
      prisma.message.count({
        where: {
          receiverId: userId,
          read: false,
          senderId: { not: userId }
        }
      })
    ])

    return NextResponse.json({
      totalListings,
      totalOffers,
      totalRevenue: totalRevenue._sum.amount || 0,
      averageRating: averageRating._avg.rating || 0,
      unreadMessages
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
