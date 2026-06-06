import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
import { getAllInventory, updateInventoryQuantity } from '@/lib/services/inventory'

export async function GET(request: NextRequest) {
  try {
    const inventory = await getAllInventory()
    return NextResponse.json(inventory)
  } catch (error) {
    console.error('[API] Get inventory error:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, quantity } = body

    if (!id || quantity === undefined) {
      return NextResponse.json(
        { error: 'Missing id or quantity' },
        { status: 400 }
      )
    }

    const updated = await updateInventoryQuantity(id, parseInt(quantity, 10))
    if (!updated) {
      return NextResponse.json({ error: 'Inventory not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Update inventory error:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    )
  }
=======
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  const [rows] = await db.execute(
    'SELECT id, item_id, quantity, location, status, last_updated FROM inventory ORDER BY id DESC'
  )
  return NextResponse.json(rows)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const itemId = body.item_id
  const quantity = parseInt(body.quantity, 10)

  const [result] = await db.execute(
    'UPDATE inventory SET quantity = ?, last_updated = NOW() WHERE item_id = ?',
    [quantity, itemId]
  )

  if (result.affectedRows === 0) {
    return NextResponse.json({ error: 'Inventory not found' }, { status: 404 })
  }

  const [rows] = await db.execute('SELECT * FROM inventory WHERE item_id = ?', [itemId])
  return NextResponse.json(rows[0])
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
}
