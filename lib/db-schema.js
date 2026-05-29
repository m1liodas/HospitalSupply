// Mock Database Schema for Medical Supply Inventory System
// In production, this would be replaced with actual database queries via Laravel API

// Export statements for documentation purposes
// These types are represented as JSDoc comments for reference

/**
 * @typedef {Object} Item
 * @property {number} id
 * @property {string} name
 * @property {string} brand
 * @property {string} quantity
 * @property {number} cost_price
 * @property {number} selling_price
 * @property {string} expiration_date
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Inventory
 * @property {number} id
 * @property {number} item_id
 * @property {number} quantity
 * @property {string} location
 * @property {'active' | 'expired' | 'depleted'} status
 * @property {string} last_updated
 * @property {Item} [item]
 */

/**
 * @typedef {Object} Station
 * @property {number} id
 * @property {'ER' | 'OB-GYNE' | 'OR' | 'DR' | 'PEDIA' | 'MEDICINE' | 'SURGICAL' | 'OPD' | 'NICU'} name
 * @property {string} location
 */

/**
 * @typedef {Object} SupplyRelease
 * @property {number} id
 * @property {number} item_id
 * @property {number} station_id
 * @property {number} quantity_released
 * @property {number} quantity_remaining
 * @property {string} released_at
 * @property {string} released_by
 * @property {string} status
 * @property {Item} [item]
 * @property {Station} [station]
 */

/**
 * @typedef {Object} DailyUsage
 * @property {number} id
 * @property {number} item_id
 * @property {number} station_id
 * @property {string} usage_date
 * @property {number} am_quantity
 * @property {number} pm_quantity
 * @property {number} quantity_remaining_after
 * @property {'pending' | 'confirmed'} status
 * @property {string} [confirmed_by]
 * @property {string} [confirmed_at]
 */

/**
 * @typedef {Object} HistoryRecord
 * @property {number} id
 * @property {number} station_id
 * @property {number} item_id
 * @property {number} quantity_used_total
 * @property {number} quantity_remaining
 * @property {number} cost_value
 * @property {number} income_value
 * @property {number} profit_margin
 * @property {string} month
 * @property {string} generated_at
 */

/**
 * @typedef {Object} DashboardSummary
 * @property {number} total_items
 * @property {number} total_inventory_value
 * @property {number} total_income
 * @property {number} total_profit
 * @property {number} total_profit_margin
 * @property {Array<{station_id: number, station_name: string, items_count: number, remaining_quantity: number, cost_value: number}>} stations_overview
 * @property {Array<{item_id: number, name: string, quantity_used: number, selling_price: number, income: number}>} top_used_items
 * @property {Array<{id: number, name: string, expiration_date: string, quantity: number}>} items_near_expiration
 */

// Exported for use in API endpoints and components
export default {}
