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
    const format = searchParams.get('format') || 'csv'
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

    // Get data for export
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        listing: {
          select: {
            title: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        buyer: {
          select: {
            name: true,
            email: true
          }
        },
        listing: {
          select: {
            title: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Date',
        'Type',
        'Amount',
        'Status',
        'User',
        'Email',
        'Listing',
        'Category'
      ]

      const csvRows = [
        csvHeaders.join(','),
        ...transactions.map(t => [
          t.createdAt.toISOString().split('T')[0],
          t.type,
          t.amount,
          t.status,
          t.user?.name || '',
          t.user?.email || '',
          t.listing?.title || '',
          t.listing?.category || ''
        ].join(',')),
        ...payments.map(p => [
          p.createdAt.toISOString().split('T')[0],
          'PAYMENT',
          p.amount,
          p.status,
          p.buyer?.name || '',
          p.buyer?.email || '',
          p.listing?.title || '',
          p.listing?.category || ''
        ].join(','))
      ]

      const csvContent = csvRows.join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="luxbid-report-${range}.csv"`
        }
      })
    } else {
      // For PDF, return JSON data (would need a PDF library for actual PDF generation)
      return NextResponse.json({
        transactions,
        payments,
        exportDate: new Date().toISOString(),
        dateRange: range
      })
    }

  } catch (error) {
    console.error('Error exporting report:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}
