import { NextRequest, NextResponse } from 'next/server'
import { mockHistoryRecords, mockItems, mockStations } from '@/lib/mock-data'

let history = mockHistoryRecords.map(h => ({
  ...h,
  station: mockStations.find(s => s.id === h.station_id),
  item: mockItems.find(i => i.id === h.item_id),
}))

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const month = searchParams.get('month')
  const stationId = searchParams.get('station_id')
  
  let filtered = history
  
  if (month) {
    filtered = filtered.filter(h => h.month === month)
  }
  
  if (stationId) {
    filtered = filtered.filter(h => h.station_id === parseInt(stationId))
  }
  
  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { month } = body
  
  // Generate monthly audit records
  const newRecords = mockStations.flatMap(station =>
    mockItems.slice(0, 3).map(item => ({
      id: Math.max(...history.map(h => h.id), 0) + 1,
      station_id: station.id,
      item_id: item.id,
      quantity_used_total: Math.floor(Math.random() * 500),
      quantity_remaining: Math.floor(Math.random() * 1000),
      cost_value: Math.floor(Math.random() * 2000),
      income_value: Math.floor(Math.random() * 5000),
      profit_margin: parseFloat((Math.random() * 100).toFixed(2)),
      month,
      generated_at: new Date().toISOString(),
      station: station,
      item: item,
    }))
  )
  
  history.push(...newRecords)
  return NextResponse.json(newRecords, { status: 201 })
}
