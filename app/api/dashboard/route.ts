import { NextRequest, NextResponse } from 'next/server'
import { getDashboardSummary } from '@/lib/services/dashboard'

export async function GET(request: NextRequest) {
  try {
    const summary = await getDashboardSummary()
    return NextResponse.json(summary)
  } catch (error) {
    console.error('[API] Dashboard error:', error)

    return NextResponse.json(
      {
        total_items: 0,
        total_inventory_value: 0,
        total_income: 0,
        total_profit: 0,
        total_profit_margin: 0,
        stations_overview: [],
        top_used_items: [],
        items_near_expiration: [],
      },
      { status: 500 }
    )
  }
}
