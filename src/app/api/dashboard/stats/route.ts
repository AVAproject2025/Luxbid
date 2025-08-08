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

    // Get total listings
    const totalListings = await prisma.listing.count({
      where: { sellerId: userId }
    })

    // Get active listings
    const activeListings = await prisma.listing.count({
      where: { 
        sellerId: userId,
        status: 'ACTIVE'
      }
    })

    // Get total offers on user's listings
    const totalOffers = await prisma.offer.count({
      where: {
        listing: {
          sellerId: userId
        }
      }
    })

    // Get total revenue from completed payments
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        listing: {
          sellerId: userId
        },
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      }
    })

    // Get total transactions
    const totalTransactions = await prisma.transaction.count({
      where: { userId }
    })

    // Get average rating
    const averageRating = await prisma.review.aggregate({
      where: {
        listing: {
          sellerId: userId
        }
      },
      _avg: {
        rating: true
      }
    })

    // Get unread messages
    const unreadMessages = await prisma.message.count({
      where: {
        listing: {
          sellerId: userId
        },
        read: false,
        senderId: {
          not: userId
        }
      }
    })

    return NextResponse.json({
      totalListings,
      activeListings,
      totalOffers,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalTransactions,
      averageRating: averageRating._avg.rating || 0,
      unreadMessages
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
