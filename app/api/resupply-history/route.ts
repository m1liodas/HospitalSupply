import { NextRequest, NextResponse } from 'next/server'
import { getResupplyHistoryByDateRange } from '@/lib/services/resupply'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate') || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    const page = parseInt(searchParams.get('page') || '1', 10) || 1
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10) || 50

    const result = await getResupplyHistoryByDateRange(startDate, endDate, page, pageSize)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] Resupply history error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch resupply history' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { clearType, startDate, endDate } = body

    if (!clearType) {
      return NextResponse.json({ message: 'clearType is required' }, { status: 400 })
    }

    let query = 'DELETE FROM resupply_history WHERE 1=1'
    const params: any[] = []

    if (clearType === 'all') {
      // Clear all records
      query = 'DELETE FROM resupply_history'
    } else if (clearType === 'dateRange') {
      // Clear by date range
      if (!startDate || !endDate) {
        return NextResponse.json({ message: 'startDate and endDate are required for dateRange' }, { status: 400 })
      }
      query += ' AND DATE(added_at) >= ? AND DATE(added_at) <= ?'
      params.push(startDate, endDate)
    } else if (clearType === 'lastMonth') {
      // Clear last month's data
      query += ' AND DATE(added_at) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND DATE(added_at) < CURDATE()'
    } else {
      return NextResponse.json({ message: 'Invalid clearType' }, { status: 400 })
    }

    await db.execute(query, params)

    return NextResponse.json({ success: true, message: `Successfully cleared resupply history (${clearType})` })
  } catch (error) {
    console.error('[API] Clear resupply history error:', error)
    return NextResponse.json(
      { message: 'Failed to clear resupply history' },
      { status: 500 }
    )
  }
}
