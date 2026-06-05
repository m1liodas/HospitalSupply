import db from '@/lib/db'

export interface UsageRecord {
  id: number
  item_id: number
  station_name: string
  quantity_used: number
  released_at: string
  released_by: string
  quantity_before: number
  quantity_after: number
}

export interface ReleaseSupplyInput {
  item_id: number
  station_name: string
  quantity_to_release: number
  released_by: string
}

/**
 * Get all usage/release history
 */
export async function getAllUsageHistory(): Promise<UsageRecord[]> {
  try {
    const [rows]: any = await db.execute(
      `SELECT sh.id, sh.item_id, sh.station_name, sh.quantity_released as quantity_used,
              sh.released_at, sh.released_by, sh.quantity_before, sh.quantity_after
       FROM supply_history sh
       ORDER BY sh.released_at DESC`
    )
    return rows || []
  } catch (error) {
    console.error('[Services] Get usage history error:', error)
    throw new Error('Failed to fetch usage history')
  }
}

/**
 * Get usage history by date range
 */
export async function getUsageHistoryByDateRange(
  startDate: string,
  endDate: string,
  stationName?: string
): Promise<any[]> {
  try {
    let query = `SELECT sh.*, i.name as item_name, i.brand as item_brand
                 FROM supply_history sh
                 LEFT JOIN items i ON i.items_id = sh.item_id
                 WHERE sh.released_at >= ? AND sh.released_at <= ?`
    const params: any[] = [startDate, endDate]

    if (stationName) {
      query += ` AND sh.station_name = ?`
      params.push(stationName)
    }

    query += ` ORDER BY sh.released_at DESC`

    const [rows]: any = await db.execute(query, params)
    return rows || []
  } catch (error) {
    console.error('[Services] Get usage history by date range error:', error)
    throw new Error('Failed to fetch usage history')
  }
}

/**
 * Record supply release
 */
export async function recordSupplyRelease(
  data: ReleaseSupplyInput
): Promise<boolean> {
  try {
    const { item_id, station_name, quantity_to_release, released_by } = data

    // Get current item quantity
    const [items]: any = await db.execute(
      'SELECT quantity FROM items WHERE items_id = ?',
      [item_id]
    )

    if (!items || items.length === 0) {
      throw new Error('Item not found')
    }

    const quantity_before = items[0].quantity

    // Update item quantity
    const new_quantity = quantity_before - quantity_to_release
    if (new_quantity < 0) {
      throw new Error('Insufficient quantity available')
    }

    // Record in supply history
    await db.execute(
      `INSERT INTO supply_history (item_id, station_name, quantity_released, quantity_before, quantity_after, released_by, released_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [item_id, station_name, quantity_to_release, quantity_before, new_quantity, released_by]
    )

    // Update item quantity
    await db.execute('UPDATE items SET quantity = ? WHERE items_id = ?', [
      new_quantity,
      item_id,
    ])

    return true
  } catch (error) {
    console.error('[Services] Record supply release error:', error)
    throw new Error('Failed to record supply release')
  }
}

/**
 * Get top used items
 */
export async function getTopUsedItems(limit: number = 10): Promise<any[]> {
  try {
    const [rows]: any = await db.execute(
      `SELECT sh.item_id, i.name, i.brand, COUNT(*) as release_count,
              SUM(sh.quantity_released) as total_quantity_released
       FROM supply_history sh
       LEFT JOIN items i ON i.items_id = sh.item_id
       GROUP BY sh.item_id
       ORDER BY total_quantity_released DESC
       LIMIT ?`,
      [limit]
    )
    return rows || []
  } catch (error) {
    console.error('[Services] Get top used items error:', error)
    throw new Error('Failed to fetch top used items')
  }
}
