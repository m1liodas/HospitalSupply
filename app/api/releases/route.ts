<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server'
import { releaseSupplies } from '@/lib/services/releases'
=======
// app/api/releases/route.ts

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

export async function GET() {
  try {
    const [rows] = await db.execute(`SELECT *, dr_id AS id FROM dr_station ORDER BY dr_id DESC`)
    return NextResponse.json(rows)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Failed to fetch releases' }, { status: 500 })
  }
}
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
<<<<<<< HEAD
    const message = await releaseSupplies(body)
    return NextResponse.json(
      { success: true, message },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[API] Release supplies error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to release supplies' },
      { status: 500 }
    )
=======

    const { station: stationSlug, items } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'No items provided' }, { status: 400 })
    }

    const stationConfig = STATION_TABLES[String(stationSlug || '').toLowerCase()]

    if (!stationConfig) {
      return NextResponse.json({ message: 'Missing or unknown station' }, { status: 400 })
    }

    const { table: tableName, pk: tablePk } = stationConfig

    for (const item of items) {
      // GET ITEM FROM ITEMS TABLE
      const [rows]: any = await db.execute(`SELECT *, items_id AS id FROM items WHERE items_id = ?`, [item.item_id])

      if (rows.length === 0) {
        continue
      }

      const itemData = rows[0]

      // CHECK AVAILABLE STOCK
      if (item.quantity > itemData.quantity) {
        return NextResponse.json({ message: `Not enough stock for ${itemData.name}` }, { status: 400 })
      }

      const quantityBefore = itemData.quantity
      const quantityAfter = quantityBefore - item.quantity

      // CHECK IF ITEM ALREADY EXISTS IN TARGET STATION
      const [existingRows]: any = await db.execute(
        `SELECT *, ${tablePk} AS id FROM ${tableName} WHERE name = ? AND brand = ?`,
        [itemData.name, itemData.brand]
      )

      // IF ITEM EXISTS -> UPDATE
      if (existingRows.length > 0) {
        await db.execute(
          `UPDATE ${tableName} SET quantity = quantity + ?, quantity_remaining = quantity_remaining + ? WHERE ${stationConfig.pk} = ?`,
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
      await db.execute(`UPDATE items SET quantity = quantity - ? WHERE items_id = ?`, [item.quantity, item.item_id])

      // LOG TO SUPPLY HISTORY TABLE FOR AUDIT
      await db.execute(
        `INSERT INTO supply_history (item_id, item_name, item_brand, quantity_released, quantity_before, quantity_after, station_name, released_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.item_id,
          itemData.name,
          itemData.brand,
          item.quantity,
          quantityBefore,
          quantityAfter,
          stationSlug.toUpperCase(),
          'admin'
        ]
      )
    }

    return NextResponse.json({ success: true, message: `Supplies released successfully to ${stationSlug.toUpperCase()} Station` }, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 })
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
  }
}
