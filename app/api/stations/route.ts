import { NextRequest, NextResponse } from 'next/server'
import { mockStations } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  return NextResponse.json(mockStations)
}
