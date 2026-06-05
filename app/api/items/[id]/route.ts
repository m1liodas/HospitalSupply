import { NextRequest, NextResponse } from 'next/server'
import { getItemById, updateItem, deleteItem } from '@/lib/services/items'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

      const additionalQuantity = parseInt(body.quantity, 10)
      const newQuantity = currentItem.quantity + additionalQuantity

      const updatedItem = await updateItem(itemId, { quantity: newQuantity })
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
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
}
