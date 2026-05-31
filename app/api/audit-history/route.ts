import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
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
  }
}
