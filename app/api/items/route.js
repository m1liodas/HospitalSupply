import { NextResponse } from 'next/server'
<<<<<<< HEAD
import { getAllItems, createItem } from '@/lib/services/items'

export async function GET(request) {
  try {
    const items = await getAllItems()
    return NextResponse.json(items)
  } catch (error) {
    console.error('[API] Get items error:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const item = await createItem(body)
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('[API] Create item error:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
=======
import db from '@/lib/db'

export async function GET(request) {
  const [rows] = await db.execute(
    'SELECT items_id AS id, name, brand, quantity, selling_price, expiration_date, created_at, updated_at FROM items ORDER BY items_id DESC'
  )
  return NextResponse.json(rows)
}

export async function POST(request) {
  const body = await request.json()
  const quantity = parseInt(body.quantity, 10)
  const sellingPrice = parseFloat(body.selling_price)

  const [result] = await db.execute(
    'INSERT INTO items (name, brand, quantity, selling_price, expiration_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
    [body.name, body.brand, quantity, sellingPrice, body.expiration_date]
  )

  const insertId = result.insertId
  const [rows] = await db.execute('SELECT *, items_id AS id FROM items WHERE items_id = ?', [insertId])
  return NextResponse.json(rows[0], { status: 201 })
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
}
