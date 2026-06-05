import db from '@/lib/db'

export interface Station {
  id: number
  name: string
  location?: string
}

const STATIONS: Station[] = [
  { id: 1, name: 'ER', location: 'Emergency Room' },
  { id: 2, name: 'OB-GYNE', location: 'Obstetrics & Gynecology' },
  { id: 3, name: 'OR', location: 'Operating Room' },
  { id: 4, name: 'DR', location: 'Delivery Room' },
  { id: 5, name: 'PEDIA', location: 'Pediatrics' },
  { id: 6, name: 'MEDICINE', location: 'General Medicine' },
  { id: 7, name: 'SURGICAL', location: 'Surgical Ward' },
  { id: 8, name: 'OPD', location: 'Outpatient Department' },
  { id: 9, name: 'NICU', location: 'Neonatal ICU' },
]

/**
 * Get all stations
 */
export async function getAllStations(): Promise<Station[]> {
  try {
    return STATIONS
  } catch (error) {
    console.error('[Services] Get all stations error:', error)
    throw new Error('Failed to fetch stations')
  }
}

/**
 * Get station by ID
 */
export async function getStationById(stationId: number): Promise<Station | null> {
  try {
    return STATIONS.find((s) => s.id === stationId) || null
  } catch (error) {
    console.error('[Services] Get station by ID error:', error)
    throw new Error('Failed to fetch station')
  }
}

/**
 * Get station by name
 */
export async function getStationByName(
  stationName: string
): Promise<Station | null> {
  try {
    return (
      STATIONS.find(
        (s) => s.name.toLowerCase() === stationName.toLowerCase()
      ) || null
    )
  } catch (error) {
    console.error('[Services] Get station by name error:', error)
    throw new Error('Failed to fetch station')
  }
}
