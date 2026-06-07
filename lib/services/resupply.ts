import db from '@/lib/db'

export interface ResupplyRecord {
  id: number
  item_id: number
  quantity_added: number
  notes: string
  added_at: string
}

export async function getResupplyHistoryByDateRange(
  startDate: string,
  endDate: string,
  page: number = 1,
  pageSize: number = 50
): Promise<{ rows: any[]; total: number }> {
  try {
    const offset = (page - 1) * pageSize

    const [rows]: any = await db.execute(
      `SELECT rh.*, i.name as item_name, i.brand as item_brand
       FROM resupply_history rh
       LEFT JOIN items i ON i.items_id = rh.item_id
       WHERE rh.added_at >= ? AND rh.added_at <= ?
       ORDER BY rh.added_at DESC
       LIMIT ? OFFSET ?`,
      [startDate, endDate, pageSize, offset]
    )

    const [countRows]: any = await db.execute(
      `SELECT COUNT(*) as total FROM resupply_history WHERE added_at >= ? AND added_at <= ?`,
      [startDate, endDate]
    )

    const total = (countRows && countRows[0] && countRows[0].total) || 0

    return { rows: rows || [], total }
  } catch (error) {
    console.error('[Services] Get resupply history error:', error)
    throw new Error('Failed to fetch resupply history')
  }
}

export async function recordResupply(
  itemId: number,
  quantityAdded: number,
  notes: string
): Promise<boolean> {
  try {
    await db.execute(
      `INSERT INTO resupply_history (item_id, quantity_added, notes, added_at)
       VALUES (?, ?, ?, NOW())`,
      [itemId, quantityAdded, notes || '']
    )
    return true
  } catch (error) {
    console.error('[Services] Record resupply error:', error)
    throw new Error('Failed to record resupply')
  }
}

/**
 * Clear all resupply history
 */
export async function clearAllResupplyHistory(): Promise<number> {
  try {
    const [result]: any = await db.execute('DELETE FROM resupply_history')
    return result.affectedRows || 0
  } catch (error) {
    console.error('[Services] Clear all resupply history error:', error)
    throw new Error('Failed to clear all resupply history')
  }
}

/**
 * Clear resupply history by date range
 */
export async function clearResupplyHistoryByDateRange(
  startDate: string,
  endDate: string
): Promise<number> {
  try {
    const [result]: any = await db.execute(
      'DELETE FROM resupply_history WHERE added_at >= ? AND added_at <= ?',
      [startDate, endDate]
    )
    return result.affectedRows || 0
  } catch (error) {
    console.error('[Services] Clear resupply history by date range error:', error)
    throw new Error('Failed to clear resupply history by date range')
  }
}

/**
 * Clear resupply history from past months
 */
export async function clearResupplyHistoryPastMonths(months: number): Promise<number> {
  try {
    const [result]: any = await db.execute(
      `DELETE FROM resupply_history WHERE added_at < DATE_SUB(NOW(), INTERVAL ? MONTH)`,
      [months]
    )
    return result.affectedRows || 0
  } catch (error) {
    console.error('[Services] Clear resupply history past months error:', error)
    throw new Error('Failed to clear resupply history for past months')
  }
}
