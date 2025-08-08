import { NextResponse } from 'next/server'

export async function GET() {
  // Mock data for now
  const flaggedItems = [
    {
      id: '1',
      type: 'LISTING',
      reason: 'Inappropriate content',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      item: {
        id: '1',
        title: 'Fake Rolex Watch',
        seller: 'John Doe'
      }
    },
    {
      id: '2',
      type: 'USER',
      reason: 'Suspicious activity',
      status: 'REVIEWED',
      createdAt: new Date().toISOString(),
      item: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com'
      }
    }
  ]

  return NextResponse.json({ flaggedItems })
}
