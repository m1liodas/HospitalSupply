import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

const STATION_TABLES: Record<string, { table: string; pk: string }> = {
  dr: { table: 'dr_station', pk: 'dr_id' },
  er: { table: 'er_station', pk: 'er_id' },
  medicine: { table: 'medicine_station', pk: 'medicine_id' },
  nicu: { table: 'nicu_station', pk: 'nicu_id' },
  'ob-gyne': { table: 'ob_gyne_station', pk: 'ob_gyne_id' },
  opd: { table: 'opd_station', pk: 'opd_id' },
  or: { table: 'or_station', pk: 'or_id' },
  pedia: { table: 'pedia_station', pk: 'pedia_id' },
  surgical: { table: 'surgical_station', pk: 'surgical_id' },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ station: string }> }
) {
  try {
    const { station } = await params
    const slug = String(station || '').toLowerCase()

    const stationConfig = STATION_TABLES[slug]

    if (!stationConfig) {
      return NextResponse.json({ message: 'Unknown station' }, { status: 404 })
    }

    const { table: tableName, pk: tablePk } = stationConfig

    const [rows] = await db.query(`SELECT *, ${tablePk} AS id FROM ${tableName} ORDER BY ${tablePk} DESC`)

    return NextResponse.json(rows)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Failed to fetch station data' }, { status: 500 })
  }
}