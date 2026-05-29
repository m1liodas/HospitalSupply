// Mock Database Schema for Medical Supply Inventory System
// In production, this would be replaced with actual database queries via Laravel API

export interface Item {
  id: number
  name: string
  brand: string
  quantity: string
  cost_price: number
  selling_price: number
  expiration_date: string
  created_at: string
  updated_at: string
}

export interface Inventory {
  id: number
  item_id: number
  quantity: number
  location: string
  status: 'active' | 'expired' | 'depleted'
  last_updated: string
  item?: Item
}

export interface Station {
  id: number
  name: 'ER' | 'OB-GYNE' | 'OR' | 'DR' | 'PEDIA' | 'MEDICINE' | 'SURGICAL' | 'OPD' | 'NICU'
  location: string
}

export interface SupplyRelease {
  id: number
  item_id: number
  station_id: number
  quantity_released: number
  quantity_remaining: number
  released_at: string
  released_by: string
  status: string
  item?: Item
  station?: Station
}

export interface DailyUsage {
  id: number
  item_id: number
  station_id: number
  usage_date: string
  am_quantity: number
  pm_quantity: number
  quantity_remaining_after: number
  status: 'pending' | 'confirmed'
  confirmed_by?: string
  confirmed_at?: string
}

export interface HistoryRecord {
  id: number
  station_id: number
  item_id: number
  quantity_used_total: number
  quantity_remaining: number
  cost_value: number
  income_value: number
  profit_margin: number
  month: string
  generated_at: string
}

export interface DashboardSummary {
  total_items: number
  total_inventory_value: number
  total_income: number
  total_profit: number
  total_profit_margin: number
  stations_overview: Array<{
    station_id: number
    station_name: string
    items_count: number
    remaining_quantity: number
    cost_value: number
  }>
  top_used_items: Array<{
    item_id: number
    name: string
    quantity_used: number
    selling_price: number
    income: number
  }>
  items_near_expiration: Array<{
    id: number
    name: string
    expiration_date: string
    quantity: number
  }>
}
