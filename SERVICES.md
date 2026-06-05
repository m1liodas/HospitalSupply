# Database Services Layer

This document explains the centralized database services layer that consolidates all database operations into a single, trackable location.

## Directory Structure

```
lib/services/
├── index.ts              # Barrel export file for all services
├── auth.ts               # User authentication operations
├── items.ts              # Item management operations
├── dashboard.ts          # Dashboard metrics and summaries
├── stations.ts           # Hospital station data
├── inventory.ts          # Inventory tracking
├── usage.ts              # Supply usage and release history
└── releases.ts           # Supply release operations
```

## Service Files Overview

### `auth.ts` - Authentication Service
Handles all user authentication operations:
- `loginUser(username, password)` - Authenticate user
- `signupUser(username, password, role)` - Create new user account
- `getUserById(userId)` - Get user by ID

**Used by**: `/app/api/auth/route.js`

### `items.ts` - Items Service
Manages medical supply items in the central inventory:
- `getAllItems()` - Fetch all items
- `getItemById(itemId)` - Get specific item
- `createItem(data)` - Create new item
- `updateItem(itemId, data)` - Update item details
- `deleteItem(itemId)` - Delete item
- `getItemsNearExpiration()` - Get items expiring within 30 days

**Used by**: `/app/api/items/route.js`, `/app/api/items/[id]/route.ts`

### `dashboard.ts` - Dashboard Service
Calculates and returns dashboard metrics:
- `getDashboardSummary()` - Complete dashboard data including:
  - Total items count
  - Total inventory value
  - Total income from releases
  - Profit calculations
  - Station overview
  - Top used items
  - Items near expiration

**Used by**: `/app/api/dashboard/route.ts`

### `stations.ts` - Stations Service
Manages hospital station information:
- `getAllStations()` - Get all hospital stations
- `getStationById(stationId)` - Get station by ID
- `getStationByName(stationName)` - Get station by name

**Used by**: `/app/api/stations/route.ts`

### `inventory.ts` - Inventory Service
Manages inventory tracking:
- `getAllInventory()` - Get all inventory items
- `getInventoryByItemId(itemId)` - Get inventory for specific item
- `updateInventoryQuantity(inventoryId, quantity)` - Update inventory quantity

**Used by**: `/app/api/inventory/route.ts`

### `usage.ts` - Usage Service
Tracks supply usage and audit history:
- `getAllUsageHistory()` - Get all usage records
- `getUsageHistoryByDateRange(startDate, endDate, stationName)` - Get filtered usage history
- `recordSupplyRelease(data)` - Record a supply release
- `getTopUsedItems(limit)` - Get most used items

**Used by**: `/app/api/audit-history/route.ts`

### `releases.ts` - Releases Service
Handles supply release operations:
- `releaseSupplies(data)` - Release supplies to a station

**Used by**: `/app/api/releases/route.ts`

## API Route Structure

All API routes now follow a clean pattern:
1. Accept request
2. Call appropriate service function
3. Return response

**Example**:
```typescript
// Before: Database logic mixed in API route
export async function GET(request) {
  const [rows] = await db.execute('SELECT ...')
  return NextResponse.json(rows)
}

// After: Clean separation of concerns
import { getAllItems } from '@/lib/services/items'

export async function GET(request) {
  const items = await getAllItems()
  return NextResponse.json(items)
}
```

## Benefits

✅ **Single Source of Truth**: All database queries in one place  
✅ **Easy to Track**: Changes to queries are centralized  
✅ **Reusable**: Services can be called from multiple API routes or server actions  
✅ **Better Error Handling**: Consistent error handling across all operations  
✅ **Type Safety**: Full TypeScript support with interfaces  
✅ **Maintainability**: Clear function names and documentation  

## Database Connection

All services use the shared database pool from `lib/db.js`:
```typescript
import db from '@/lib/db'
```

## Adding New Operations

To add a new database operation:

1. **Create/Update service file** in `lib/services/`
2. **Add function with documentation**:
```typescript
/**
 * Clear description of what this function does
 */
export async function myNewOperation(param: string): Promise<ReturnType> {
  try {
    // Query logic here
  } catch (error) {
    console.error('[Services] Operation error:', error)
    throw new Error('Failed to perform operation')
  }
}
```

3. **Update API route** to use the service
4. **Export from index.ts** if it's a main operation

## Removed Dummy Data

The following dummy data has been removed:
- ❌ Hardcoded admin/admin credentials in auth
- ❌ Mock data in API routes
- ❌ Duplicate database queries across pages

All data now comes from actual database operations through the centralized services.

## Error Handling

All services follow consistent error handling patterns:
- Console log with `[Services]` prefix for debugging
- Throw descriptive error messages
- API routes catch and return appropriate HTTP status codes

## Performance Considerations

- Services use parameterized queries to prevent SQL injection
- Dashboard service uses `Promise.all()` for parallel queries
- Station tables are cached in service constants to avoid redundant queries
