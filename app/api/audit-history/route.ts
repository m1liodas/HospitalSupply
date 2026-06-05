import { NextRequest, NextResponse } from 'next/server'
import { getUsageHistoryByDateRange } from '@/lib/services/usage'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate') || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    const stationName = searchParams.get('stationName') || undefined

    const rows = await getUsageHistoryByDateRange(startDate, endDate, stationName)
    return NextResponse.json(rows)
  } catch (error) {
    console.error('[API] Audit history error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch audit history' },
      { status: 500 }
    )
  }
}
