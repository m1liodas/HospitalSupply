import { NextRequest, NextResponse } from 'next/server'
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
}
