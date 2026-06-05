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

/**
 * GET /api/station-monthly-entry
 * Fetch all periods for a station (last 3 months)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const station = searchParams.get('station')

    if (!station) {
      return NextResponse.json({ message: 'Station parameter required' }, { status: 400 })
    }

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Fetch last 3 months from archive for this station only
    let archiveData: any = []
    try {
      const [rows]: any = await db.execute(`
        SELECT DISTINCT month_year FROM usage_logs_archive
        WHERE month_year IS NOT NULL
        AND stations_id = ?
        ORDER BY month_year DESC
        LIMIT 3
      `, [station])
      archiveData = rows
    } catch (error: any) {
      if (error?.message?.includes("Unknown column 'stations_id'")) {
        const [rows]: any = await db.execute(`
          SELECT DISTINCT month_year FROM usage_logs_archive
          WHERE month_year IS NOT NULL
          ORDER BY month_year DESC
          LIMIT 3
        `)
        archiveData = rows
      } else {
        throw error
      }
    }

    const periods = [
      { month_year: currentMonth, label: 'Current Month', isArchive: false },
      ...archiveData.map((row: any) => ({
        month_year: row.month_year,
        label: formatMonthYear(row.month_year),
        isArchive: true
      }))
    ]

    return NextResponse.json({ periods, currentMonth })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Failed to fetch periods' }, { status: 500 })
  }
}

/**
 * POST /api/station-monthly-entry
 * Archive current month and start new entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { station: stationSlug } = body

    if (!stationSlug) {
      return NextResponse.json({ message: 'Station parameter required' }, { status: 400 })
    }

    const stationConfig = STATION_TABLES[String(stationSlug || '').toLowerCase()]

    if (!stationConfig) {
      return NextResponse.json({ message: 'Unknown station' }, { status: 400 })
    }

    const { table: tableName, pk: tablePk } = stationConfig

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // 1. Get all current items and usage data for this station
    const [stationItems]: any = await db.execute(`SELECT *, ${tablePk} AS id FROM ${tableName}`)

    // 2. Archive the current usage logs and station state
    for (const item of stationItems) {
      // Archive current state
      await db.execute(`
        INSERT INTO station_period_history 
        (station_name, item_id, item_name, item_brand, quantity_received, quantity_used, quantity_remaining, month_year)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        stationSlug.toUpperCase(),
        item.id,
        item.name,
        item.brand,
        item.quantity || 0,
        (item.quantity || 0) - (item.quantity_remaining || 0),
        item.quantity_remaining || 0,
        currentMonth
      ])

      // Move usage logs to archive
      try {
        await db.execute(`
          INSERT INTO usage_logs_archive (item_id, usage_date, am_quantity, pm_quantity, month_year, stations_id)
          SELECT item_id, usage_date, am_quantity, pm_quantity, ?, ?
          FROM usage_logs
          WHERE item_id = ?
          AND (month_year IS NULL OR month_year = ?)
          AND (stations_id = ? OR stations_id IS NULL)
        `, [currentMonth, stationSlug, item.id, currentMonth, stationSlug])
      } catch (error: any) {
        if (error?.message?.includes("Unknown column 'stations_id'")) {
          await db.execute(`
            INSERT INTO usage_logs_archive (item_id, usage_date, am_quantity, pm_quantity, month_year)
            SELECT item_id, usage_date, am_quantity, pm_quantity, ?
            FROM usage_logs
            WHERE item_id = ?
            AND (month_year IS NULL OR month_year = ?)
          `, [currentMonth, item.id, currentMonth])
        } else {
          throw error
        }
      }
    }

    // 3. Clear usage logs for current month
    await db.execute(`DELETE FROM usage_logs WHERE month_year IS NULL OR month_year = ?`, [currentMonth])

    // 4. Update remaining quantities to become new base quantities
    // Remaining qty becomes the new "quantity" for next period
    await db.execute(`
      UPDATE ${tableName} 
      SET quantity = quantity_remaining, quantity_remaining = quantity_remaining, current_period = ?
    `, [currentMonth])

    // 5. Clean old archived data (keep only last 3 months)
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    const cutoffMonth = `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}`

    await db.execute(`DELETE FROM usage_logs_archive WHERE month_year < ?`, [cutoffMonth])
    await db.execute(`DELETE FROM station_period_history WHERE month_year < ?`, [cutoffMonth])

    return NextResponse.json({
      success: true,
      message: `New entry created. Previous month (${currentMonth}) archived. All AM/PM values reset to 0.`,
      currentMonth: `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}`
    })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ message: error.message || 'Failed to create new entry' }, { status: 500 })
  }
}

function formatMonthYear(monthYear: string): string {
  const [year, month] = monthYear.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleString('default', { month: 'long', year: 'numeric' })
}
