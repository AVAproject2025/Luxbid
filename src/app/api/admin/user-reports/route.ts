import { NextResponse } from 'next/server'

export async function GET() {
  // Mock data for now
  const userReports = [
    {
      id: '1',
      reporter: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      reportedUser: {
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      reason: 'Suspicious activity',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      reporter: {
        name: 'Bob Wilson',
        email: 'bob@example.com'
      },
      reportedUser: {
        name: 'Alice Brown',
        email: 'alice@example.com'
      },
      reason: 'Inappropriate behavior',
      status: 'REVIEWED',
      createdAt: new Date().toISOString()
    }
  ]

  return NextResponse.json({ userReports })
}
