import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
import { getItemById, updateItem, deleteItem } from '@/lib/services/items'
import { recordResupply } from '@/lib/services/resupply'
=======
import db from '@/lib/db'
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
<<<<<<< HEAD
  try {
    const { id } = await params
    const itemId = parseInt(id)
    const item = await getItemById(itemId)

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('[API] Get item error:', error)
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 })
  }
=======
  const { id } = await params
  const itemId = parseInt(await id)
  const [rows] = await db.execute('SELECT *, items_id AS id FROM items WHERE items_id = ?', [itemId])

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  return NextResponse.json(rows[0])
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
<<<<<<< HEAD
  try {
    const { id } = await params
    const body = await request.json()
    const itemId = parseInt(id)

    // Handle adding quantity (for resupply)
    if (body.action === 'add') {
      const currentItem = await getItemById(itemId)
      if (!currentItem) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }

      const additionalQuantity = parseInt(String(body.quantity), 10) || 0
      const currentQuantity = parseInt(String(currentItem.quantity), 10) || 0
      const newQuantity = currentQuantity + additionalQuantity

      const updatedItem = await updateItem(itemId, { quantity: newQuantity })

      // Attempt to record resupply history (best-effort)
      try {
        await recordResupply(itemId, additionalQuantity, body.notes || '')
      } catch (err) {
        console.error('Failed to record resupply history:', err)
      }

      return NextResponse.json(updatedItem)
    }

    // Handle regular update
    const updatedItem = await updateItem(itemId, body)
    if (!updatedItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('[API] Update item error:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
=======
  const { id } = await params
  const body = await request.json()
  const itemId = parseInt(await id)
  
  // Get current item first
  const [currentRows] = await db.execute('SELECT *, items_id AS id FROM items WHERE items_id = ?', [itemId])
  if (!Array.isArray(currentRows) || currentRows.length === 0) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  const currentItem = currentRows[0]

  // Handle adding quantity (for resupply)
  if (body.action === 'add') {
    const additionalQuantity = parseInt(body.quantity, 10)
    const newQuantity = parseInt(currentItem.quantity) + additionalQuantity

    await db.execute(
      'UPDATE items SET quantity = ?, updated_at = NOW() WHERE items_id = ?',
      [newQuantity, itemId]
    )

    const [rows] = await db.execute('SELECT *, items_id AS id FROM items WHERE items_id = ?', [itemId])
    return NextResponse.json(rows[0])
  }

  // Handle regular update (from edit modal)
  const quantity = parseInt(body.quantity, 10)
  const sellingPrice = parseFloat(body.selling_price)

  await db.execute(
    'UPDATE items SET name = ?, brand = ?, quantity = ?, selling_price = ?, expiration_date = ?, updated_at = NOW() WHERE items_id = ?',
    [body.name, body.brand, quantity, sellingPrice, body.expiration_date, itemId]
  )

  const [rows] = await db.execute('SELECT *, items_id AS id FROM items WHERE items_id = ?', [itemId])
  return NextResponse.json(rows[0])
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
<<<<<<< HEAD
  try {
    const { id } = await params
    const itemId = parseInt(id)

    const deleted = await deleteItem(itemId)
    if (!deleted) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, id: itemId })
  } catch (error) {
    console.error('[API] Delete item error:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
=======
  const { id } = await params
  const itemId = parseInt(await id)

  const [result] = await db.execute('DELETE FROM items WHERE items_id = ?', [itemId])

  if (result.affectedRows === 0) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, id: itemId })
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
}
