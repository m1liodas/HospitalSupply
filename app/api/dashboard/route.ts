import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { DashboardSummary } from '@/lib/db-schema'

export async function GET(request: NextRequest) {
  try {

    // Total Items
    const [[{ total_items }]]: any = await db.execute(
      'SELECT COUNT(*) as total_items FROM items'
    )

    // Total Inventory Value
    const [[{ total_inventory_value }]]: any = await db.execute(
      `SELECT IFNULL(SUM(quantity * COALESCE(selling_price, 0)), 0)
       as total_inventory_value
       FROM items`
    )

    // Total Income
    const [[{ total_income }]]: any = await db.execute(
      `SELECT IFNULL(
          SUM(sh.quantity_released * COALESCE(i.selling_price, 0)),
          0
        ) as total_income
       FROM supply_history sh
       LEFT JOIN items i ON i.items_id = sh.item_id`
    )

    // Total Cost
    const [[{ total_cost }]]: any = await db.execute(
      `SELECT IFNULL(
          SUM(sh.quantity_released * COALESCE(i.selling_price, 0)),
          0
        ) as total_cost
       FROM supply_history sh
       LEFT JOIN items i ON i.items_id = sh.item_id`
    )

    const totalProfit =
      Number(total_income || 0) - Number(total_cost || 0)

    const totalProfitMargin =
      Number(total_income) > 0
        ? (totalProfit / Number(total_income)) * 100
        : 0

    // Station Tables
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

    const stationsOverview = []

    for (const station of STATIONS) {

      const table = STATION_TABLES[station.id]

      if (!table) continue

      // Items Count + Remaining Quantity
      const [[itemsRow]]: any = await db.execute(
        `SELECT
          COUNT(DISTINCT name, brand) AS items_count,
          IFNULL(SUM(quantity_remaining), 0) AS remaining_quantity
         FROM ${table}`
      )

      // Station Cost Value
      const [[costRow]]: any = await db.execute(
        `SELECT
          IFNULL(
            SUM(
              s.quantity_remaining *
              COALESCE(i.selling_price, 0)
            ),
            0
          ) AS cost_value
         FROM ${table} s
         LEFT JOIN items i
         ON i.name = s.name
         AND i.brand = s.brand`
      )

      stationsOverview.push({
        station_id: station.id,
        station_name: station.name,
        items_count: Number(itemsRow.items_count || 0),
        remaining_quantity: Number(itemsRow.remaining_quantity || 0),
        cost_value: Number(costRow.cost_value || 0),
      })
    }

    // Top Used Items
    const [topRows]: any = await db.execute(
      `SELECT
          sh.item_id,
          i.name,
          i.brand,
          i.selling_price,
          IFNULL(SUM(sh.quantity_released), 0) AS quantity_used,
          IFNULL(
            SUM(
              sh.quantity_released *
              COALESCE(i.selling_price, 0)
            ),
            0
          ) AS income
       FROM supply_history sh
       LEFT JOIN items i
       ON i.items_id = sh.item_id
       GROUP BY sh.item_id
       ORDER BY quantity_used DESC
       LIMIT 5`
    )

    const topUsedItems = (topRows || []).map((r: any) => ({
      item_id: r.item_id,
      name: r.name,
      brand: r.brand,
      quantity_used: Number(r.quantity_used || 0),
      selling_price: Number(r.selling_price || 0),
      income: Number(r.income || 0),
    }))

    // No expiration table yet
    const itemsNearExpiration = []

    const summary: DashboardSummary = {
      total_items: Number(total_items || 0),
      total_inventory_value: Number(total_inventory_value || 0),
      total_income: Math.round(Number(total_income || 0)),
      total_profit: Math.round(totalProfit || 0),
      total_profit_margin: parseFloat(
        Number(totalProfitMargin || 0).toFixed(2)
      ),
      stations_overview: stationsOverview,
      top_used_items: topUsedItems,
      items_near_expiration: itemsNearExpiration,
    }

    return NextResponse.json(summary)

  } catch (error) {

    console.error('Dashboard DB error:', error)

    const summary: DashboardSummary = {
      total_items: 0,
      total_inventory_value: 0,
      total_income: 0,
      total_profit: 0,
      total_profit_margin: 0,
      stations_overview: [],
      top_used_items: [],
      items_near_expiration: [],
    }

    return NextResponse.json(summary, {
      status: 500,
    })
  }
}