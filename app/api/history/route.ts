import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month')
    const stationName = searchParams.get('station_name')

    let query = `SELECT sh.*, i.name as item_name, i.brand as item_brand FROM supply_history sh LEFT JOIN items i ON i.items_id = sh.item_id WHERE 1=1`
    const params: any[] = []

    if (month) {
      query += ' AND DATE_FORMAT(sh.released_at, "%Y-%m") = ?'
      params.push(month)
    }

    if (stationName) {
      query += ' AND sh.station_name = ?'
      params.push(stationName)
    }

    query += ' ORDER BY sh.released_at DESC'

    const [rows] = await db.execute(query, params)
    return NextResponse.json(rows)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Failed to fetch history' }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
}
