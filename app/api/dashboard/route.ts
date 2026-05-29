import { NextRequest, NextResponse } from 'next/server'
import { mockItems, mockInventory, mockStations, mockSupplyReleases, mockDailyUsages } from '@/lib/mock-data'
import { DashboardSummary } from '@/lib/db-schema'

export async function GET(request: NextRequest) {
  // Calculate totals
  const totalInventoryValue = mockInventory.reduce((sum, inv) => {
    const item = mockItems.find(i => i.id === inv.item_id)
    return sum + (inv.quantity * (item?.cost_price || 0))
  }, 0)
  
  // Get usage data
  const totalUsed = mockSupplyReleases.filter(r => r.status === 'confirmed').reduce((sum, r) => {
    return sum + r.quantity_released
  }, 0)
  
  // Calculate income and profit
  const totalIncome = totalUsed * 1.2 * mockItems[0].selling_price / 10 // Simplified calculation
  const totalProfit = totalIncome - (totalUsed * mockItems[0].cost_price / 10)
  const totalProfitMargin = totalIncome > 0 ? (totalProfit / totalIncome) * 100 : 0
  
  const stationsOverview = mockStations.map(station => ({
    station_id: station.id,
    station_name: station.name,
    items_count: mockSupplyReleases.filter(r => r.station_id === station.id).length,
    remaining_quantity: Math.floor(Math.random() * 500),
    cost_value: Math.floor(Math.random() * 5000),
  }))
  
  const topUsedItems = mockItems.slice(0, 3).map(item => ({
    item_id: item.id,
    name: item.name,
    quantity_used: Math.floor(Math.random() * 200),
    selling_price: item.selling_price,
    income: Math.floor(Math.random() * 2000),
  }))
  
  const summary: DashboardSummary = {
    total_items: mockItems.length,
    total_inventory_value: totalInventoryValue,
    total_income: Math.round(totalIncome),
    total_profit: Math.round(totalProfit),
    total_profit_margin: parseFloat(totalProfitMargin.toFixed(2)),
    stations_overview: stationsOverview,
    top_used_items: topUsedItems,
    items_near_expiration: mockItems.slice(0, 2).map(item => ({
      id: item.id,
      name: item.name,
      expiration_date: item.expiration_date,
      quantity: Math.floor(Math.random() * 100),
    })),
  }
  
  return NextResponse.json(summary)
}
