import { NextRequest, NextResponse } from 'next/server'

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
}
