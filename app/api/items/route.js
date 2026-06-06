import { NextResponse } from 'next/server'
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
}
