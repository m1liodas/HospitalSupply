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

export async function GET() {
  try {
    const [rows]: any = await db.execute(`SELECT * FROM usage_logs ORDER BY usage_date ASC`)

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

    const tableName = STATION_TABLES[String(stationSlug || '').toLowerCase()]

    if (!tableName) {
      return NextResponse.json({ message: 'Missing or unknown station' }, { status: 400 })
    }

    // CHECK EXISTING USAGE
    const [existingRows]: any = await db.execute(
      `
      SELECT * FROM usage_logs
      WHERE item_id = ?
      AND usage_date = ?
      `,
      [item_id, usage_date]
    )

    let oldAM = 0
    let oldPM = 0

    if (existingRows.length > 0) {
      oldAM = existingRows[0].am_quantity || 0
      oldPM = existingRows[0].pm_quantity || 0
    }

    // GET CURRENT STOCK
    const [stationRows]: any = await db.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [item_id]
    )

    if (stationRows.length === 0) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 })
    }

    const currentRemaining =
      stationRows[0].quantity_remaining || 0

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
    await db.execute(`UPDATE ${tableName} SET quantity_remaining = ? WHERE id = ?`, [newRemaining, item_id])

    // UPDATE OR INSERT USAGE LOG
    if (existingRows.length > 0) {

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

    // no-op, using shared pool

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