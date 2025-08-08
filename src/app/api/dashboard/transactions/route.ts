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

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        description: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json({ transactions })

  } catch (error) {
    console.error('Error fetching recent transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent transactions' },
      { status: 500 }
    )
  }
}
