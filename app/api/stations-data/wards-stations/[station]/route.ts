import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

const STATION_TABLES: Record<string, string> = {
  dr: 'dr_station',
  er: 'er_station',
  medicine: 'medicine_station',
  nicu: 'nicu_station',
  'ob-gyne': 'ob_gyne_station',
  opd: 'opd_station',
  or: 'or_station',
  pedia: 'pedia_station',
  surgical: 'surgical_station',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ station: string }> }
) {
  try {
    const { station } = await params
    const slug = String(station || '').toLowerCase()

    const tableName = STATION_TABLES[slug]

    if (!tableName) {
      return NextResponse.json({ message: 'Unknown station' }, { status: 404 })
    }

    const [rows] = await db.query(`SELECT * FROM ${tableName} ORDER BY id DESC`)

    return NextResponse.json(rows)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Failed to fetch station data' }, { status: 500 })
  }
}