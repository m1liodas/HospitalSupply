import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request) {
  const [rows] = await db.execute(
    'SELECT id, name, brand, quantity, selling_price, expiration_date, created_at, updated_at FROM items ORDER BY id DESC'
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
  const [rows] = await db.execute('SELECT * FROM items WHERE id = ?', [insertId])
  return NextResponse.json(rows[0], { status: 201 })
}
