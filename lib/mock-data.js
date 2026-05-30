export const mockStations = [
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

export const mockSupplyReleases = [
  {
    id: 1,
    item_id: 1,
    station_id: 1,
    quantity_released: 500,
    quantity_remaining: 45020,
    released_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    released_by: 'Admin User',
    status: 'confirmed',
    item: mockItems[0],
    station: mockStations[0],
  },
  {
    id: 2,
    item_id: 2,
    station_id: 1,
    quantity_released: 300,
    quantity_remaining: 272200,
    released_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    released_by: 'Admin User',
    status: 'confirmed',
    item: mockItems[1],
    station: mockStations[0],
  },
]

export const mockDailyUsages = Array.from({ length: 31 }, (_, day) => ({
  id: day + 1,
  item_id: 1,
  station_id: 1,
  usage_date: new Date(Date.now() - (30 - day) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  am_quantity: Math.floor(Math.random() * 10),
  pm_quantity: Math.floor(Math.random() * 10),
  quantity_remaining_after: 5100 - (day + 1) * 5,
  status: day < 3 ? 'pending' : 'confirmed',
  confirmed_by: day < 3 ? undefined : 'Nurse Smith',
  confirmed_at: day < 3 ? undefined : new Date(Date.now() - (30 - day) * 24 * 60 * 60 * 1000).toISOString(),
}))

export const mockHistoryRecords = [
  {
    id: 1,
    station_id: 1,
    item_id: 1,
    quantity_used_total: 150,
    quantity_remaining: 350,
    cost_value: 175,
    income_value: 180,
    profit_margin: 2.86,
    month: '2024-05',
    generated_at: new Date().toISOString(),
  },
  {
    id: 2,
    station_id: 1,
    item_id: 2,
    quantity_used_total: 100,
    quantity_remaining: 200,
    cost_value: 80,
    income_value: 200,
    profit_margin: 60.0,
    month: '2024-05',
    generated_at: new Date().toISOString(),
  },
]
