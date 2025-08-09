import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PRICING_TIERS } from '@/lib/pricing'
import { z } from 'zod'

const upgradeSchema = z.object({
  tier: z.enum(['BASIC', 'PREMIUM', 'VIP', 'DIAMOND']),
  paymentMethod: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier, paymentMethod } = upgradeSchema.parse(body)

    // Get pricing info
    const tierInfo = PRICING_TIERS.find(t => t.id.toUpperCase() === tier)
    if (!tierInfo) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    // Calculate membership expiry (monthly billing)
    const membershipExpiry = new Date()
    membershipExpiry.setMonth(membershipExpiry.getMonth() + 1)

    // Update user membership
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        membershipTier: tier as any,
        membershipExpiry: tierInfo.monthlyFee > 0 ? membershipExpiry : null,
        totalSpent: {
          increment: tierInfo.monthlyFee / 100 // Convert cents to euros
        }
      },
      select: {
        id: true,
        membershipTier: true,
        membershipExpiry: true,
        totalSpent: true
      }
    })

    // Create payment record
    if (tierInfo.monthlyFee > 0) {
      await prisma.payment.create({
        data: {
          amount: tierInfo.monthlyFee / 100, // Convert to euros
          currency: 'EUR',
          status: 'COMPLETED',
          type: 'SUBSCRIPTION',
          userId: session.user.id,
          description: `${tierInfo.name} membership upgrade`,
          stripePaymentIntentId: `membership_${Date.now()}` // Mock for now
        }
      })
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      tier: tierInfo,
      message: `Successfully upgraded to ${tierInfo.name} membership!`
    })

  } catch (error: any) {
    console.error('Membership upgrade error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to upgrade membership' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        membershipTier: true,
        membershipExpiry: true,
        totalSpent: true,
        totalEarned: true,
        listingCount: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if membership expired
    const isExpired = user.membershipExpiry && new Date() > user.membershipExpiry
    const currentTier = PRICING_TIERS.find(t => t.id.toUpperCase() === user.membershipTier)

    return NextResponse.json({
      user,
      currentTier,
      isExpired,
      availableTiers: PRICING_TIERS,
      membershipStatus: isExpired ? 'EXPIRED' : 'ACTIVE'
    })

  } catch (error) {
    console.error('Get membership error:', error)
    return NextResponse.json({ error: 'Failed to get membership info' }, { status: 500 })
  }
}
