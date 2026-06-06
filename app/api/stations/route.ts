import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
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
=======

const STATIONS = [
  { id: 1, name: 'ER' },
  { id: 2, name: 'OB-GYNE' },
  { id: 3, name: 'OR' },
  { id: 4, name: 'DR' },
  { id: 5, name: 'PEDIA' },
  { id: 6, name: 'MEDICINE' },
  { id: 7, name: 'SURGICAL' },
  { id: 8, name: 'OPD' },
  { id: 9, name: 'NICU' },
]

export async function GET(request: NextRequest) {
  return NextResponse.json(STATIONS)
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
}
