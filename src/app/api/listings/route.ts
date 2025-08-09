import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createListingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  condition: z.string().min(1, "Condition is required"),
  askingPrice: z.number().positive("Asking price must be positive"),
  images: z.array(z.string()).optional(),
  endDate: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'ACTIVE'

    const where: Record<string, unknown> = { status }
    if (category) {
      where.category = category
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            offers: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
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

    // Any authenticated user can create listings
    // Role check removed - everyone can buy and sell

    const body = await request.json()
    const validatedData = createListingSchema.parse(body)

    const listing = await prisma.listing.create({
      data: {
        ...validatedData,
        images: JSON.stringify(validatedData.images || []),
        sellerId: session.user.id,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}
