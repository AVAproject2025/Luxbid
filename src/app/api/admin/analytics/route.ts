import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parallel queries for dashboard metrics
    const [
      totalUsers,
      totalListings,
      totalOffers,
      totalRevenue,
      membershipStats,
      recentPayments,
      topListings,
      userGrowth
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total listings
      prisma.listing.count(),
      
      // Total offers
      prisma.offer.count(),
      
      // Total revenue (sum of all payments)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      }),
      
      // Membership tier distribution
      prisma.user.groupBy({
        by: ['membershipTier'],
        _count: { membershipTier: true }
      }),
      
      // Recent payments
      prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      
      // Top listings by offer count
      prisma.listing.findMany({
        take: 10,
        include: {
          _count: { select: { offers: true } },
          seller: { select: { name: true } }
        },
        orderBy: {
          offers: { _count: 'desc' }
        }
      }),
      
      // User growth last 30 days
      prisma.user.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Calculate revenue metrics
    const monthlyRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })

    const lastMonthRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })

    // Calculate conversion rates
    const acceptedOffers = await prisma.offer.count({
      where: { status: 'ACCEPTED' }
    })
    
    const conversionRate = totalOffers > 0 ? (acceptedOffers / totalOffers) * 100 : 0

    // Active premium users
    const premiumUsers = await prisma.user.count({
      where: {
        membershipTier: { not: 'BASIC' },
        OR: [
          { membershipExpiry: null },
          { membershipExpiry: { gt: new Date() } }
        ]
      }
    })

    const analytics = {
      overview: {
        totalUsers,
        totalListings,
        totalOffers,
        totalRevenue: totalRevenue._sum.amount || 0,
        premiumUsers,
        conversionRate: Math.round(conversionRate * 100) / 100
      },
      revenue: {
        thisMonth: monthlyRevenue._sum.amount || 0,
        lastMonth: lastMonthRevenue._sum.amount || 0,
        growth: lastMonthRevenue._sum.amount 
          ? Math.round(((monthlyRevenue._sum.amount || 0) - (lastMonthRevenue._sum.amount || 0)) / (lastMonthRevenue._sum.amount || 1) * 100 * 100) / 100
          : 0
      },
      membershipTiers: membershipStats.map(stat => ({
        tier: stat.membershipTier,
        count: stat._count.membershipTier
      })),
      recentPayments: recentPayments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        type: payment.type,
        status: payment.status,
        createdAt: payment.createdAt,
        user: payment.user
      })),
      topListings: topListings.map(listing => ({
        id: listing.id,
        title: listing.title,
        brand: listing.brand,
        askingPrice: listing.askingPrice,
        offers: listing._count.offers,
        seller: listing.seller.name,
        status: listing.status
      })),
      userGrowth: userGrowth.length
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
