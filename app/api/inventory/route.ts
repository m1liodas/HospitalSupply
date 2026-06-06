import { NextRequest, NextResponse } from 'next/server'
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
}
