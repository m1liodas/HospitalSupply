import { NextRequest, NextResponse } from 'next/server'
import { releaseSupplies } from '@/lib/services/releases'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = await releaseSupplies(body)
    return NextResponse.json(
      { success: true, message },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[API] Release supplies error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to release supplies' },
      { status: 500 }
    )
  }
}
