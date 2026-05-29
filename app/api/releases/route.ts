// app/api/releases/route.ts

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
    const [rows] = await db.execute(`SELECT * FROM dr_station ORDER BY id DESC`)
    return NextResponse.json(rows)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Failed to fetch releases' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { station: stationSlug, items } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'No items provided' }, { status: 400 })
    }

    const tableName = STATION_TABLES[String(stationSlug || '').toLowerCase()]

    if (!tableName) {
      return NextResponse.json({ message: 'Missing or unknown station' }, { status: 400 })
    }

    for (const item of items) {
      // GET ITEM FROM ITEMS TABLE
      const [rows]: any = await db.execute(`SELECT * FROM items WHERE id = ?`, [item.item_id])

      if (rows.length === 0) {
        continue
      }

      const itemData = rows[0]

      // CHECK AVAILABLE STOCK
      if (item.quantity > itemData.quantity) {
        return NextResponse.json({ message: `Not enough stock for ${itemData.name}` }, { status: 400 })
      }

      // CHECK IF ITEM ALREADY EXISTS IN TARGET STATION
      const [existingRows]: any = await db.execute(
        `SELECT * FROM ${tableName} WHERE name = ? AND brand = ?`,
        [itemData.name, itemData.brand]
      )

      // IF ITEM EXISTS -> UPDATE
      if (existingRows.length > 0) {
        await db.execute(
          `UPDATE ${tableName} SET quantity = quantity + ?, quantity_remaining = quantity_remaining + ? WHERE id = ?`,
          [item.quantity, item.quantity, existingRows[0].id]
        )
      } else {
        // INSERT NEW ITEM
        await db.execute(
          `INSERT INTO ${tableName} (name, brand, quantity, quantity_remaining, expiration_date, date_receive) VALUES (?, ?, ?, ?, ?, NOW())`,
          [itemData.name, itemData.brand, item.quantity, item.quantity, itemData.expiration_date]
        )
      }

      // DEDUCT FROM MAIN INVENTORY
      await db.execute(`UPDATE items SET quantity = quantity - ? WHERE id = ?`, [item.quantity, item.item_id])
    }

    return NextResponse.json({ success: true, message: `Supplies released successfully to ${stationSlug.toUpperCase()} Station` }, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}