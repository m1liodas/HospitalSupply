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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const station = searchParams.get('station')
    const monthYear = searchParams.get('month_year')

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const targetMonth = monthYear || currentMonth

    let query = ''
    let params: any[] = []

    if (targetMonth !== currentMonth) {
      query = `SELECT * FROM usage_logs_archive WHERE month_year = ?`
      params = [targetMonth]
      if (station) {
        query += ` AND stations_id = ?`
        params.push(station)
      }
      query += ` ORDER BY usage_date ASC`
    } else {
      query = `SELECT * FROM usage_logs WHERE (month_year = ? OR month_year IS NULL)`
      params = [currentMonth]
      if (station) {
        query += ` AND stations_id = ?`
        params.push(station)
      }
      query += ` ORDER BY usage_date ASC`
    }

    let rows: any = []
    try {
      const [result]: any = await db.execute(query, params)
      rows = result
    } catch (error: any) {
      if (error?.message?.includes("Unknown column 'stations_id'")) {
        const fallbackQuery = query.replace(/ AND stations_id = \?/, '')
        const [result]: any = await db.execute(fallbackQuery, params.slice(0, -1))
        rows = result
      } else {
        throw error
      }
    }
    return NextResponse.json(rows)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { message: 'Failed to fetch usage logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {

  try {

    const body = await request.json()

    const {
      station: stationSlug,
      item_id,
      usage_date,
      am_quantity,
      pm_quantity,
    } = body

    const stationConfig = STATION_TABLES[String(stationSlug || '').toLowerCase()]

    if (!stationConfig) {
      return NextResponse.json({ message: 'Missing or unknown station' }, { status: 400 })
    }

    const tableName = stationConfig.table
    const tablePk = stationConfig.pk

    // CHECK EXISTING USAGE
    let existingRows: any = []
    let hasStationColumn = true

    try {
      const [rows]: any = await db.execute(
        `
        SELECT * FROM usage_logs
        WHERE item_id = ?
        AND usage_date = ?
        AND stations_id = ?
        `,
        [item_id, usage_date, stationSlug]
      )
      existingRows = rows
    } catch (error: any) {
      if (error?.message?.includes("Unknown column 'stations_id'")) {
        hasStationColumn = false
        const [rows]: any = await db.execute(
          `
          SELECT * FROM usage_logs
          WHERE item_id = ?
          AND usage_date = ?
          `,
          [item_id, usage_date]
        )
        existingRows = rows
      } else {
        throw error
      }
    }

    let oldAM = 0
    let oldPM = 0

    if (existingRows.length > 0) {
      oldAM = existingRows[0].am_quantity || 0
      oldPM = existingRows[0].pm_quantity || 0
    }

    // GET CURRENT STOCK
    const [stationRows]: any = await db.execute(
      `SELECT *, ${tablePk} AS id FROM ${tableName} WHERE ${tablePk} = ?`,
      [item_id]
    )

    if (stationRows.length === 0) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 })
    }

    const currentRemaining =
      stationRows[0].quantity_remaining || 0
    const quantityReceived =
      stationRows[0].quantity || 0

    // RESTORE OLD VALUES
    const restoredStock =
      currentRemaining + oldAM + oldPM

    // NEW REMAINING
    const newRemaining =
      restoredStock - am_quantity - pm_quantity

    if (newRemaining < 0) {
      return NextResponse.json({ message: 'Not enough stock available' }, { status: 400 })
    }

    // UPDATE REMAINING STOCK
    await db.execute(`UPDATE ${tableName} SET quantity_remaining = ? WHERE ${tablePk} = ?`, [newRemaining, item_id])

    // UPDATE OR INSERT USAGE LOG
    if (existingRows.length > 0) {
      if (hasStationColumn) {
        await db.execute(
          `
          UPDATE usage_logs
          SET
            am_quantity = ?,
            pm_quantity = ?
          WHERE item_id = ?
          AND usage_date = ?
          AND stations_id = ?
          `,
          [
            am_quantity,
            pm_quantity,
            item_id,
            usage_date,
            stationSlug,
          ]
        )
      } else {
        await db.execute(
          `
          UPDATE usage_logs
          SET
            am_quantity = ?,
            pm_quantity = ?
          WHERE item_id = ?
          AND usage_date = ?
          `,
          [
            am_quantity,
            pm_quantity,
            item_id,
            usage_date,
          ]
        )
      }
    } else {
      if (hasStationColumn) {
        await db.execute(
          `
          INSERT INTO usage_logs
          (
            item_id,
            usage_date,
            am_quantity,
            pm_quantity,
            stations_id
          )
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            item_id,
            usage_date,
            am_quantity,
            pm_quantity,
            stationSlug,
          ]
        )
      } else {
        await db.execute(
          `
          INSERT INTO usage_logs
          (
            item_id,
            usage_date,
            am_quantity,
            pm_quantity
          )
          VALUES (?, ?, ?, ?)
          `,
          [
            item_id,
            usage_date,
            am_quantity,
            pm_quantity,
          ]
        )
      }
    }

    // Also save to usage_logs_archive if it exists and we're saving a quantity
    try {
      const [archiveExists]: any = await db.execute(
        `SELECT 1 FROM usage_logs_archive WHERE item_id = ? AND usage_date = ? AND stations_id = ? LIMIT 1`,
        [item_id, usage_date, stationSlug]
      )

      if (archiveExists && archiveExists.length > 0) {
        // Update archive record with remaining quantity
        await db.execute(
          `
          UPDATE usage_logs_archive
          SET 
            am_quantity = ?,
            pm_quantity = ?,
            remaining_quantity = ?,
            quantity_received = ?
          WHERE item_id = ?
          AND usage_date = ?
          AND stations_id = ?
          `,
          [
            am_quantity,
            pm_quantity,
            newRemaining,
            quantityReceived,
            item_id,
            usage_date,
            stationSlug
          ]
        )
      }
    } catch (archiveError) {
      // Silently continue if archive table doesn't have the columns yet
      console.log('[Services] Archive table update skipped (table may not have updated schema)')
    }

    return NextResponse.json({
      message: 'Usage saved successfully',
      quantity_remaining: newRemaining
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { message: 'Server Error' },
      { status: 500 }
    )
  }
}
