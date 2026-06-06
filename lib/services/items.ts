import db from '@/lib/db'

export interface Item {
  id: number
  name: string
  brand: string
  quantity: number
  selling_price: number
  expiration_date: string
  created_at: string
  updated_at: string
}

export interface CreateItemInput {
  name: string
  brand: string
  quantity: number
  selling_price: number
  expiration_date: string
}

/**
 * Get all items
 */
export async function getAllItems(): Promise<Item[]> {
  try {
    const [rows]: any = await db.execute(
      'SELECT items_id AS id, name, brand, quantity, selling_price, expiration_date, created_at, updated_at FROM items ORDER BY items_id DESC'
    )
    return rows || []
  } catch (error) {
    console.error('[Services] Get all items error:', error)
    throw new Error('Failed to fetch items')
  }
}

/**
 * Get item by ID
 */
export async function getItemById(itemId: number): Promise<Item | null> {
  try {
    const [rows]: any = await db.execute(
      'SELECT items_id AS id, name, brand, quantity, selling_price, expiration_date, created_at, updated_at FROM items WHERE items_id = ?',
      [itemId]
    )

    return rows && rows.length > 0 ? rows[0] : null
  } catch (error) {
    console.error('[Services] Get item by ID error:', error)
    throw new Error('Failed to fetch item')
  }
}

/**
 * Create new item
 */
export async function createItem(data: CreateItemInput): Promise<Item> {
  try {
    const { name, brand, quantity, selling_price, expiration_date } = data
    const quantity_num = parseInt(String(quantity), 10)
    const price_num = parseFloat(String(selling_price))

    const [result]: any = await db.execute(
      'INSERT INTO items (name, brand, quantity, selling_price, expiration_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [name, brand, quantity_num, price_num, expiration_date]
    )

    const itemId = result.insertId
    const [rows]: any = await db.execute(
      'SELECT items_id AS id, name, brand, quantity, selling_price, expiration_date, created_at, updated_at FROM items WHERE items_id = ?',
      [itemId]
    )

    return rows[0]
  } catch (error) {
    console.error('[Services] Create item error:', error)
    throw new Error('Failed to create item')
  }
}

/**
 * Update item
 */
export async function updateItem(
  itemId: number,
  data: Partial<CreateItemInput>
): Promise<Item | null> {
  try {
    const fields: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      fields.push('name = ?')
      values.push(data.name)
    }
    if (data.brand !== undefined) {
      fields.push('brand = ?')
      values.push(data.brand)
    }
    if (data.quantity !== undefined) {
      fields.push('quantity = ?')
      values.push(parseInt(String(data.quantity), 10))
    }
    if (data.selling_price !== undefined) {
      fields.push('selling_price = ?')
      values.push(parseFloat(String(data.selling_price)))
    }
    if (data.expiration_date !== undefined) {
      fields.push('expiration_date = ?')
      values.push(data.expiration_date)
    }

    if (fields.length === 0) {
      return getItemById(itemId)
    }

    fields.push('updated_at = NOW()')
    values.push(itemId)

    const query = `UPDATE items SET ${fields.join(', ')} WHERE items_id = ?`
    await db.execute(query, values)

    return getItemById(itemId)
  } catch (error) {
    console.error('[Services] Update item error:', error)
    throw new Error('Failed to update item')
  }
}

/**
 * Delete item
 */
export async function deleteItem(itemId: number): Promise<boolean> {
  try {
    const [result]: any = await db.execute('DELETE FROM items WHERE items_id = ?', [
      itemId,
    ])
    return result.affectedRows > 0
  } catch (error) {
    console.error('[Services] Delete item error:', error)
    throw new Error('Failed to delete item')
  }
}

/**
 * Get items near expiration (within 30 days)
 */
export async function getItemsNearExpiration(): Promise<Item[]> {
  try {
    const [rows]: any = await db.execute(
      `SELECT items_id AS id, name, brand, quantity, selling_price, expiration_date, created_at, updated_at 
       FROM items 
       WHERE expiration_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
       ORDER BY expiration_date ASC`
    )
    return rows || []
  } catch (error) {
    console.error('[Services] Get items near expiration error:', error)
    throw new Error('Failed to fetch items near expiration')
  }
}
