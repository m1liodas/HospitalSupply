import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const [rows] = await db.execute('SELECT * FROM items WHERE id = ?', [parseInt(await id)])

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  return NextResponse.json(rows[0])
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const itemId = parseInt(await id)
  const quantity = parseInt(body.quantity, 10)
  const sellingPrice = parseFloat(body.selling_price)

  await db.execute(
    'UPDATE items SET name = ?, brand = ?, quantity = ?, selling_price = ?, expiration_date = ?, updated_at = NOW() WHERE id = ?',
    [body.name, body.brand, quantity, sellingPrice, body.expiration_date, itemId]
  )

  const [rows] = await db.execute('SELECT * FROM items WHERE id = ?', [itemId])
  return NextResponse.json(rows[0])
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const itemId = parseInt(await id)

  const [result] = await db.execute('DELETE FROM items WHERE id = ?', [itemId])

  if (result.affectedRows === 0) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, id: itemId })
}
