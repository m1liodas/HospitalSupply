import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'medsupply',
})

export async function GET() {
  try {

    const [rows] = await db.execute(`
      SELECT * FROM er_station
      ORDER BY id DESC
    `)

    return NextResponse.json(rows)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { message: 'Failed to fetch DR station items' },
      { status: 500 }
    )
  }
}