import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
import { getUsageHistoryByDateRange } from '@/lib/services/usage'
=======
import db from '@/lib/db'
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
<<<<<<< HEAD
    const startDate = searchParams.get('startDate') || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    const stationName = searchParams.get('stationName') || undefined

    const page = parseInt(searchParams.get('page') || '1', 10) || 1
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10) || 50

    const result = await getUsageHistoryByDateRange(startDate, endDate, stationName, page, pageSize)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] Audit history error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch audit history' },
      { status: 500 }
    )
=======
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const stationName = searchParams.get('stationName')

    let query = 'SELECT * FROM supply_history WHERE 1=1'
    const params: any[] = []

    if (startDate) {
      query += ' AND DATE(released_at) >= ?'
      params.push(startDate)
    }

    if (endDate) {
      query += ' AND DATE(released_at) <= ?'
      params.push(endDate)
    }

    if (stationName) {
      query += ' AND station_name = ?'
      params.push(stationName)
    }

    query += ' ORDER BY released_at DESC'

    const [rows] = await db.execute(query, params)

    return NextResponse.json(rows)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Failed to fetch audit history' }, { status: 500 })
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
  }
}
