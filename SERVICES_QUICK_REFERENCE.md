# Quick Reference - Database Services

## Import Any Service

```typescript
import { functionName } from '@/lib/services'
// or
import { functionName } from '@/lib/services/auth'  // specific file
```

## Auth Service

```typescript
import { loginUser, signupUser, getUserById } from '@/lib/services/auth'

await loginUser(username, password)
await signupUser(username, password, role)
await getUserById(userId)
```

## Items Service

```typescript
import { 
  getAllItems, 
  getItemById, 
  createItem, 
  updateItem, 
  deleteItem, 
  getItemsNearExpiration 
} from '@/lib/services/items'

await getAllItems()
await getItemById(itemId)
await createItem({ name, brand, quantity, selling_price, expiration_date })
await updateItem(itemId, { name, quantity, ... })
await deleteItem(itemId)
await getItemsNearExpiration()
```

## Dashboard Service

```typescript
import { getDashboardSummary } from '@/lib/services/dashboard'

const summary = await getDashboardSummary()
// Returns: { total_items, total_inventory_value, total_income, total_profit, 
//            total_profit_margin, stations_overview, top_used_items, items_near_expiration }
```

## Stations Service

```typescript
import { getAllStations, getStationById, getStationByName } from '@/lib/services/stations'

await getAllStations()
await getStationById(stationId)
await getStationByName('ER')
```

## Inventory Service

```typescript
import { getAllInventory, getInventoryByItemId, updateInventoryQuantity } from '@/lib/services/inventory'

await getAllInventory()
await getInventoryByItemId(itemId)
await updateInventoryQuantity(inventoryId, newQuantity)
```

## Usage Service

```typescript
import { 
  getAllUsageHistory, 
  getUsageHistoryByDateRange, 
  recordSupplyRelease, 
  getTopUsedItems 
} from '@/lib/services/usage'

await getAllUsageHistory()
await getUsageHistoryByDateRange(startDate, endDate, stationName)
await recordSupplyRelease({ item_id, station_name, quantity_to_release, released_by })
await getTopUsedItems(limit)
```

## Releases Service

```typescript
import { releaseSupplies } from '@/lib/services/releases'

await releaseSupplies({ station: 'er', items: [{ item_id, quantity }] })
```

## Error Handling Pattern

All services throw errors. Handle them in API routes:

```typescript
import { getAllItems } from '@/lib/services/items'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const items = await getAllItems()
    return NextResponse.json(items)
  } catch (error) {
    console.error('[API] Get items error:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}
```

## Database Connection

All services automatically use the shared pool from `lib/db.js`:

```typescript
import db from '@/lib/db'

// All queries use this shared connection pool
const [rows] = await db.execute('SELECT * FROM items')
```

## Adding a New Service Function

1. Add to appropriate service file
2. Follow naming: `verb + noun` (e.g., `getItems`, `createItem`, `updateInventory`)
3. Include JSDoc comment
4. Export from `lib/services/index.ts`
5. Update API route to use it

**Example:**

```typescript
// In lib/services/items.ts
/**
 * Get items by category
 */
export async function getItemsByCategory(category: string): Promise<Item[]> {
  try {
    const [rows]: any = await db.execute(
      'SELECT * FROM items WHERE category = ?',
      [category]
    )
    return rows || []
  } catch (error) {
    console.error('[Services] Get items by category error:', error)
    throw new Error('Failed to fetch items by category')
  }
}
```

## Console Logging

All services log with `[Services]` prefix:
```
[Services] Get items error: ...
[Services] Login error: ...
[Services] Dashboard DB error: ...
```

This makes debugging easy - search for `[Services]` in logs.

## Service Response Types

All services return:
- **Success**: Typed data (Item[], User, etc.)
- **Error**: Throws Error with message
- **Null**: Returns null if not found (not a throw)

## Common Queries

- **Get everything**: `getAll*()`
- **Get one**: `get*ById()` or `get*ByName()`
- **Create**: `create*(data)`
- **Update**: `update*(id, data)`
- **Delete**: `delete*(id)`
- **Get filtered**: `get*By*(filter)` or `get*ByDateRange()`

---

**Need more info?** See `SERVICES.md` for complete documentation.
