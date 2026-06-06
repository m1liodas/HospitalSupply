import db from '@/lib/db'

export interface ReleaseItem {
  item_id: number
  quantity: number
}

export interface ReleaseRequest {
  station: string
  items: ReleaseItem[]
}

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
 * Release supplies to a station
 */
export async function releaseSupplies(data: ReleaseRequest): Promise<string> {
  try {
    const { station: stationSlug, items } = data

    if (!items || items.length === 0) {
      throw new Error('No items provided')
    }

    const stationConfig = STATION_TABLES[String(stationSlug || '').toLowerCase()]
    if (!stationConfig) {
      throw new Error('Unknown station')
    }

    const { table: tableName, pk: tablePk } = stationConfig

    for (const item of items) {
      // Get item from items table
      const [rows]: any = await db.execute(
        'SELECT * FROM items WHERE items_id = ?',
        [item.item_id]
      )

      if (rows.length === 0) {
        continue
      }

      const itemData = rows[0]

      // Check available stock
      if (item.quantity > itemData.quantity) {
        throw new Error(`Not enough stock for ${itemData.name}`)
      }

      const quantityBefore = itemData.quantity
      const quantityAfter = quantityBefore - item.quantity

      // Check if item already exists in target station
      const [existingRows]: any = await db.execute(
        `SELECT * FROM ${tableName} WHERE name = ? AND brand = ?`,
        [itemData.name, itemData.brand]
      )

      // If item exists -> update
      if (existingRows.length > 0) {
        await db.execute(
          `UPDATE ${tableName} SET quantity = quantity + ?, quantity_remaining = quantity_remaining + ? WHERE ${tablePk} = ?`,
          [item.quantity, item.quantity, existingRows[0][tablePk]]
        )
      } else {
        // Insert new item
        await db.execute(
          `INSERT INTO ${tableName} (name, brand, quantity, quantity_remaining, expiration_date, date_receive) VALUES (?, ?, ?, ?, ?, NOW())`,
          [itemData.name, itemData.brand, item.quantity, item.quantity, itemData.expiration_date]
        )
      }

      // Deduct from main inventory
      await db.execute('UPDATE items SET quantity = quantity - ? WHERE items_id = ?', [
        item.quantity,
        item.item_id,
      ])

      // Log to supply history table for audit
      await db.execute(
        `INSERT INTO supply_history (item_id, item_name, item_brand, quantity_released, quantity_before, quantity_after, station_name, released_by, released_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          item.item_id,
          itemData.name,
          itemData.brand,
          item.quantity,
          quantityBefore,
          quantityAfter,
          stationSlug.toUpperCase(),
          'admin',
        ]
      )
    }

    return `Supplies released successfully to ${stationSlug.toUpperCase()} Station`
  } catch (error) {
    console.error('[Services] Release supplies error:', error)
    throw error
  }
}
