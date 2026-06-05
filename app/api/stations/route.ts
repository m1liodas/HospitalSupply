import { NextRequest, NextResponse } from 'next/server'
import { getAllStations } from '@/lib/services/stations'

export async function GET(request: NextRequest) {
  try {
    const stations = await getAllStations()
    return NextResponse.json(stations)
  } catch (error) {
    console.error('[API] Get stations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stations' },
      { status: 500 }
    )
  }
}
