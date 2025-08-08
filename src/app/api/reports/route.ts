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

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get total revenue
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate
        }
      },
      _sum: {
        amount: true
      }
    })

    // Get total listings
    const totalListings = await prisma.listing.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })

    // Get total offers
    const totalOffers = await prisma.offer.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })

    // Get total users
    const totalUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })

    // Get average listing price
    const averageListingPrice = await prisma.listing.aggregate({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _avg: {
        askingPrice: true
      }
    })

    // Get monthly revenue
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        SUM(amount) as revenue
      FROM Payment 
      WHERE status = 'COMPLETED' 
        AND createdAt >= ${startDate.toISOString()}
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month DESC
      LIMIT 12
    `

    // Get top categories
    const topCategories = await prisma.listing.groupBy({
      by: ['category'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      _sum: {
        askingPrice: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Calculate conversion rate
    const completedPayments = await prisma.payment.count({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate
        }
      }
    })

    const conversionRate = totalOffers > 0 ? (completedPayments / totalOffers) * 100 : 0

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      totalListings,
      totalOffers,
      totalUsers,
      averageListingPrice: averageListingPrice._avg.askingPrice || 0,
      conversionRate,
      monthlyRevenue: monthlyRevenue || [],
      topCategories: topCategories.map(cat => ({
        category: cat.category,
        count: cat._count.id,
        revenue: cat._sum.askingPrice || 0
      })),
      recentTransactions
    })

  } catch (error) {
    console.error('Error fetching report data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    )
  }
}
