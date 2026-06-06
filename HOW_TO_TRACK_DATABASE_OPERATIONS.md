# How to Track Database Operations

Now that all database logic is in `/lib/services/`, tracking operations is simple and organized.

## The Centralized Location

All database fetching and manipulation logic is now in:
```
/lib/services/
├── auth.ts       (authentication operations)
├── items.ts      (item CRUD operations)
├── dashboard.ts  (dashboard metrics calculations)
├── stations.ts   (station data)
├── inventory.ts  (inventory management)
├── usage.ts      (usage/release tracking)
├── releases.ts   (supply releases)
└── index.ts      (barrel exports)
```

## How to Find Any Operation

**Need to modify how items are fetched?**
→ Open `/lib/services/items.ts` and find `getAllItems()`

**Need to check dashboard calculations?**
→ Open `/lib/services/dashboard.ts` and find `getDashboardSummary()`

**Need to see how releases work?**
→ Open `/lib/services/releases.ts` and find `releaseSupplies()`

**Need audit history logic?**
→ Open `/lib/services/usage.ts` and find `getUsageHistoryByDateRange()`

## Tracking Changes

### Before (Scattered):
```
To find where items are fetched:
- Check /app/api/items/route.js
- Check /app/api/central-supply/page.jsx
- Check /app/api/dashboard/route.ts
- Check any other files that might fetch items
- Search codebase for "SELECT * FROM items"
= 😞 Difficult, fragmented, error-prone
```

### After (Centralized):
```
To find where items are fetched:
- Go to /lib/services/items.ts
- Find getAllItems()
- Done!
= 😊 Easy, organized, one place
```

## Understanding Data Flow

Now it's crystal clear:

```
Component/Page
    ↓ (calls)
API Route (/api/...)
    ↓ (imports)
Service Function (/lib/services/...)
    ↓ (uses)
Database (via db pool)
```

### Example: Getting items for dashboard

1. **Page** `/app/dashboard/page.jsx`:
   ```javascript
   const data = await fetchJson('/api/dashboard')
   ```

2. **API Route** `/app/api/dashboard/route.ts`:
   ```typescript
   import { getDashboardSummary } from '@/lib/services/dashboard'
   const summary = await getDashboardSummary()
   ```

3. **Service** `/lib/services/dashboard.ts`:
   ```typescript
   // Calls multiple services internally
   async function getDashboardSummary() {
     // Gets items, stations, usage data, etc.
     const total_items = await getTotalItemsCount()
     // ... etc
   }
   ```

## Debugging Database Issues

When something is wrong with database operations:

1. **Check the logs** for `[Services]` prefix:
   ```
   [Services] Get items error: ...
   [Services] Dashboard DB error: ...
   [Services] Release supplies error: ...
   ```

2. **Find the service file** based on the error:
   ```
   [Services] Get items error: → /lib/services/items.ts
   [Services] Dashboard error: → /lib/services/dashboard.ts
   [Services] Auth error: → /lib/services/auth.ts
   ```

3. **Open the file and find the function** mentioned in the error
4. **Check the database query** and fix it

## Performance Tracking

Want to optimize a query? Here's how:

1. Find the operation in `/lib/services/`
2. Look at the SQL query being executed
3. Optimize the query
4. Changes take effect everywhere it's used

Example: Making dashboard faster
```typescript
// In /lib/services/dashboard.ts
async function getTotalItemsCount(): Promise<number> {
  // Currently does: SELECT COUNT(*) FROM items
  // To optimize: Add proper indexes, use EXPLAIN, etc.
  // Change takes effect everywhere getDashboardSummary() is called
}
```

## Adding New Operations

When you need a new database operation:

1. **Choose the right service file** based on what it does
2. **Add the function** following the naming pattern:
   ```typescript
   export async function getItemsByExpiration(): Promise<Item[]> {
     try {
       // Your query here
     } catch (error) {
       console.error('[Services] Get items by expiration error:', error)
       throw new Error('Failed to get expired items')
     }
   }
   ```

3. **Export from index.ts** if needed
4. **Use in API route**:
   ```typescript
   import { getItemsByExpiration } from '@/lib/services/items'
   const items = await getItemsByExpiration()
   ```

## Common Tracking Scenarios

### Scenario 1: "Where does this data come from?"
→ Search for the table name in `/lib/services/`
```bash
grep -r "FROM items" lib/services/
grep -r "FROM supply_history" lib/services/
```

### Scenario 2: "How is this calculation done?"
→ Look in the service that matches the calculation
```
inventory value → /lib/services/items.ts
dashboard metrics → /lib/services/dashboard.ts
profit margin → /lib/services/dashboard.ts
```

### Scenario 3: "What happens when I release supplies?"
→ Open `/lib/services/releases.ts` and read `releaseSupplies()`
→ See exactly what happens: deduction, audit log, station table update

### Scenario 4: "How do I change this query?"
→ Find the function in its service file
→ Modify the query
→ All API routes using it automatically get the change

## Service Function Naming Convention

All functions follow clear naming patterns:

| Pattern | Meaning | Example |
|---------|---------|---------|
| `get*()` | Retrieve data | `getAllItems()`, `getItemById()` |
| `get*By*()` | Retrieve with filter | `getStationByName()`, `getItemsByExpiration()` |
| `create*()` | Insert new record | `createItem()` |
| `update*()` | Modify existing | `updateItem()`, `updateInventoryQuantity()` |
| `delete*()` | Remove record | `deleteItem()` |
| `record*()` | Log an event | `recordSupplyRelease()` |

This makes it easy to guess function names without looking them up.

## Searching for Specific Operations

```bash
# Find all item operations
grep -r "export async function" lib/services/items.ts

# Find all dashboard calculations
grep -r "SELECT" lib/services/dashboard.ts

# Find all error logs (for debugging)
grep -r "[Services]" --include="*.ts" lib/services/

# Find specific query
grep -r "supply_history" lib/services/
```

## Documentation

Each service has its own function documentation:

```typescript
/**
 * Get all items ordered by newest first
 */
export async function getAllItems(): Promise<Item[]>

/**
 * Get items expiring within next 30 days
 */
export async function getItemsNearExpiration(): Promise<Item[]>

/**
 * Release supplies to a station with audit logging
 */
export async function releaseSupplies(data: ReleaseRequest): Promise<string>
```

Read the function comment to understand what it does and what it returns.

## Summary: Easy Tracking Checklist

✅ All database logic in `/lib/services/`  
✅ Clear function naming (get*, create*, update*, etc.)  
✅ Each function documented with JSDoc  
✅ All errors logged with `[Services]` prefix  
✅ Type interfaces for all return values  
✅ Single location for each operation  
✅ Easy to find, modify, and debug  

---

**That's it!** Your database operations are now organized and easy to track in one centralized location.
