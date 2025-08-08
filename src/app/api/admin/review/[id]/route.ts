import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await request.json();

    // Mock response for now
    return NextResponse.json({
      success: true,
      message: `Item ${id} ${action}ed successfully`,
      data: {
        id,
        action,
        status: action === 'approve' ? 'approved' : 'rejected'
      }
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to review item' },
      { status: 500 }
    );
  }
}
