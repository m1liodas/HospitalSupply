import db from '@/lib/db'

export interface InventoryItem {
  id: number
  item_id: number
  item_name: string
  item_brand: string
  quantity_remaining: number
  station_name: string
}

/**
 * Get all inventory items
 */
export async function getAllInventory(): Promise<any[]> {
  try {
    const [rows]: any = await db.execute('SELECT * FROM inventory')
    return rows || []
  } catch (error) {
    console.error('[Services] Get all inventory error:', error)
    throw new Error('Failed to fetch inventory')
  }
}

/**
 * Get inventory by item ID
 */
export async function getInventoryByItemId(itemId: number): Promise<any[]> {
  try {
    const [rows]: any = await db.execute(
      'SELECT * FROM inventory WHERE item_id = ?',
      [itemId]
    )
    return rows || []
  } catch (error) {
    console.error('[Services] Get inventory by item ID error:', error)
    throw new Error('Failed to fetch inventory item')
  }
}

/**
 * Update inventory quantity
 */
export async function updateInventoryQuantity(
  inventoryId: number,
  newQuantity: number
): Promise<boolean> {
  try {
    const [result]: any = await db.execute(
      'UPDATE inventory SET quantity_remaining = ? WHERE id = ?',
      [newQuantity, inventoryId]
    )
    return result.affectedRows > 0
  } catch (error) {
    console.error('[Services] Update inventory quantity error:', error)
    throw new Error('Failed to update inventory')
  }
}
