import db from '@/lib/db'

export interface StationOverview {
  station_id: number
  station_name: string
  items_count: number
  remaining_quantity: number
  cost_value: number
}

export interface TopUsedItem {
  item_id: number
  name: string
  brand: string
  quantity_used: number
  selling_price: number
  income: number
}

export interface ItemNearExpiration {
  id: number
  name: string
  quantity: number
  expiration_date: string
}

export interface DashboardSummary {
  total_items: number
  total_inventory_value: number
  total_income: number
  total_profit: number
  total_profit_margin: number
  stations_overview: StationOverview[]
  top_used_items: TopUsedItem[]
  items_near_expiration: ItemNearExpiration[]
}

const STATION_TABLES: Record<number, string> = {
  1: 'er_station',
  2: 'ob_gyne_station',
  3: 'or_station',
  4: 'dr_station',
  5: 'pedia_station',
  6: 'medicine_station',
  7: 'surgical_station',
  8: 'opd_station',
  9: 'nicu_station',
}

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

/**
 * Get total items count
 */
async function getTotalItemsCount(): Promise<number> {
  const [[{ total_items }]]: any = await db.execute(
    'SELECT COUNT(*) as total_items FROM items'
  )
  return Number(total_items || 0)
}

/**
 * Get total inventory value
 */
async function getTotalInventoryValue(): Promise<number> {
  const [[{ total_inventory_value }]]: any = await db.execute(
    `SELECT IFNULL(SUM(quantity * COALESCE(selling_price, 0)), 0) as total_inventory_value FROM items`
  )
  return Number(total_inventory_value || 0)
}

/**
 * Get total income from all releases
 */
async function getTotalIncome(): Promise<number> {
  const [[{ total_income }]]: any = await db.execute(
    `SELECT IFNULL(SUM(sh.quantity_released * COALESCE(i.selling_price, 0)), 0) as total_income
     FROM supply_history sh
     LEFT JOIN items i ON i.items_id = sh.item_id`
  )
  return Number(total_income || 0)
}

/**
 * Get stations overview
 */
async function getStationsOverview(): Promise<StationOverview[]> {
  const overview: StationOverview[] = []

  for (const station of STATIONS) {
    const table = STATION_TABLES[station.id]
    if (!table) continue

    const [[itemsRow]]: any = await db.execute(
      `SELECT COUNT(DISTINCT name, brand) AS items_count, IFNULL(SUM(quantity_remaining), 0) AS remaining_quantity FROM ${table}`
    )

    const [[costRow]]: any = await db.execute(
      `SELECT IFNULL(SUM(s.quantity_remaining * COALESCE(i.selling_price, 0)), 0) AS cost_value
       FROM ${table} s
       LEFT JOIN items i ON i.name = s.name AND i.brand = s.brand`
    )

    overview.push({
      station_id: station.id,
      station_name: station.name,
      items_count: Number(itemsRow?.items_count || 0),
      remaining_quantity: Number(itemsRow?.remaining_quantity || 0),
      cost_value: Number(costRow?.cost_value || 0),
    })
  }

  return overview
}

/**
 * Get top used items
 */
async function getTopUsedItems(): Promise<TopUsedItem[]> {
  const [topRows]: any = await db.execute(
    `SELECT sh.item_id, i.name, i.brand, i.selling_price,
            IFNULL(SUM(sh.quantity_released), 0) AS quantity_used,
            IFNULL(SUM(sh.quantity_released * COALESCE(i.selling_price, 0)), 0) AS income
     FROM supply_history sh
     LEFT JOIN items i ON i.items_id = sh.item_id
     GROUP BY sh.item_id
     ORDER BY quantity_used DESC
     LIMIT 5`
  )

  return (topRows || []).map((r: any) => ({
    item_id: r.item_id,
    name: r.name,
    brand: r.brand,
    quantity_used: Number(r.quantity_used || 0),
    selling_price: Number(r.selling_price || 0),
    income: Number(r.income || 0),
  }))
}

/**
 * Get items near expiration
 */
async function getItemsNearExpiration(): Promise<ItemNearExpiration[]> {
  const [rows]: any = await db.execute(
    `SELECT items_id AS id, name, quantity, expiration_date
     FROM items
     WHERE expiration_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
     ORDER BY expiration_date ASC
     LIMIT 10`
  )

  return (rows || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    quantity: Number(r.quantity || 0),
    expiration_date: r.expiration_date,
  }))
}

/**
 * Get complete dashboard summary
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const [
      total_items,
      total_inventory_value,
      total_income,
      stations_overview,
      top_used_items,
      items_near_expiration,
    ] = await Promise.all([
      getTotalItemsCount(),
      getTotalInventoryValue(),
      getTotalIncome(),
      getStationsOverview(),
      getTopUsedItems(),
      getItemsNearExpiration(),
    ])

    const total_cost = total_income
    const total_profit = total_income - total_cost
    const total_profit_margin =
      total_income > 0 ? (total_profit / total_income) * 100 : 0

    return {
      total_items,
      total_inventory_value,
      total_income: Math.round(total_income),
      total_profit: Math.round(total_profit),
      total_profit_margin: parseFloat(total_profit_margin.toFixed(2)),
      stations_overview,
      top_used_items,
      items_near_expiration,
    }
  } catch (error) {
    console.error('[Services] Get dashboard summary error:', error)
    throw new Error('Failed to fetch dashboard summary')
  }
}
