# Monthly Supply Tracking Implementation

## Overview
This implementation adds monthly cycling, archiving, printing, and history tracking to the station supply management system.

## What's New

### 1. **Preserve Usage Data When Releasing Supplies** ✅
- When releasing items to a station that already has that item, the quantity is **added** (not reset)
- All existing AM/PM usage data is **preserved**
- The remaining quantity increases by the released amount

**How it works:**
- Release API checks if an item already exists in the station
- If exists: Updates quantity and quantity_remaining
- If new: Inserts as new record
- Usage logs are never touched during release

### 2. **Monthly Entry System** ✅
When you click the **"New Entry"** button:
- Current month's data is archived
- All AM/PM values reset to 0 (days 1-31)
- **Quantity Received** remains the same
- **Quantity Remaining** becomes the new base quantity for the new period
- Previous month's data is accessible in the print function

**Example:**
```
Before New Entry:
- Item: Gauze
- Qty Received: 100
- Qty Remaining: 35
- AM/PM data: [10, 15, 20, etc.]

After New Entry (same day):
- Item: Gauze  
- Qty Received: 100 (same)
- Qty Remaining: 35 (same)
- AM/PM data: [0, 0, 0, etc.] (reset)
```

### 3. **Print Functionality** ✅
- Click the **"Print"** button to print the current month's data
- Prints the full usage table with all items and AM/PM values
- Optimized for A4 paper
- Hides all buttons and navigation when printing
- Maintains table formatting and readability

### 4. **Month Navigation** ✅
- Dropdown to view last 3 months of data
- "Current Month" shows today's period
- Previous months show archived data (read-only)
- Historical data preserved for reporting

### 5. **Archive System** ✅
- Keeps last 3 months of data automatically
- Older data is automatically cleaned up
- Each month snapshot includes:
  - Item names and quantities
  - Received amounts
  - Total usage (AM+PM)
  - Remaining quantities

## Database Changes

Run this SQL to enable the feature:

```sql
-- MONTHLY_TRACKING_MIGRATION.sql
-- This file is in the root directory
```

Key tables added:
- `usage_logs_archive` - Stores historical usage data
- `station_period_history` - Stores snapshots at month boundaries

Columns added:
- `month_year` (VARCHAR(7)) - Tracks which month the data belongs to
- `current_period` - Identifies the current active period for each station

## API Endpoints

### GET `/api/station-monthly-entry?station=dr`
Fetches available periods for a station (current + last 3 months)

**Response:**
```json
{
  "periods": [
    { "month_year": "2026-06", "label": "Current Month", "isArchive": false },
    { "month_year": "2026-05", "label": "May 2026", "isArchive": true },
    { "month_year": "2026-04", "label": "April 2026", "isArchive": true }
  ],
  "currentMonth": "2026-06"
}
```

### POST `/api/station-monthly-entry`
Archives current month and creates new entry

**Request:**
```json
{
  "station": "dr"
}
```

**Response:**
```json
{
  "success": true,
  "message": "New entry created. Previous month (2026-06) archived. All AM/PM values reset to 0."
}
```

## UI Features

### Month Navigation
- Dropdown selector to choose which period to view
- "Current Month" label shows today's month
- Previous months marked as "archive" (read-only)
- "New Entry" button only visible for current month

### Control Buttons
- **Print** - Print current month's usage data
- **New Entry** - Archive current month and start fresh

### Table Display
- Shows Qty Received, Remaining, and days 1-31
- AM (blue) and PM (orange) columns for each day
- Displays data for selected period (current or archived)

## Workflow Example

### Typical Monthly Flow:

**June 1 - June 30:** Working with current month
- Release supplies → Qty increases, usage preserved
- Enter AM/PM usage daily
- View current data
- Print weekly/biweekly reports

**June 30 Evening:** End of month
- Backup/print final report
- Click "New Entry" button
- Confirm the action

**July 1:** Start fresh
- All AM/PM values: 0
- Qty Received/Remaining: Same as June 30
- Data from June still accessible via dropdown

## Accessing Historical Data

1. Click the **"View Period"** dropdown
2. Select a previous month (e.g., "May 2026")
3. Table updates to show that month's data
4. Click **"Print"** to print historical data
5. "New Entry" button is disabled (archives are read-only)

## Technical Details

### State Management
- `selectedPeriod` - Currently viewed period (YYYY-MM format)
- `isArchive` - Boolean flag for read-only mode
- `availablePeriods` - Array of accessible periods

### Data Integrity
- Usage data is never modified during release
- Archives are immutable after creation
- Automatic cleanup keeps only 3 months
- New Entry performs safe transactions

### Print CSS
- Hides all interactive elements
- Optimizes layout for paper
- Preserves colors and formatting
- Page breaks between sections
- Works in all modern browsers

## Files Modified/Created

### Created:
- `MONTHLY_TRACKING_MIGRATION.sql` - Database migration script
- `app/api/station-monthly-entry/route.ts` - New API endpoint

### Modified:
- `app/stations/[station]/page.jsx` - Added UI and logic
- `app/stations/[station]/station.css` - Added print styles
- `app/central-supply/release-supply-modal.jsx` - Added fetchJson import

## Testing the Feature

### Test 1: Release with Preserved Usage
1. Go to Release Supplies modal
2. Select item already at station with usage
3. Release quantity
4. Go to station page
5. Verify: Usage data is still there, quantity increased ✅

### Test 2: New Entry
1. Enter some AM/PM usage for current month
2. Click "New Entry" button
3. Confirm action
4. Verify: All AM/PM values reset to 0 ✅
5. Verify: Qty Received/Remaining unchanged ✅

### Test 3: Print
1. Click "Print" button
2. Verify: Print dialog opens
3. Verify: Navigation/buttons hidden in preview ✅
4. Print to PDF or paper ✅

### Test 4: History Navigation
1. Click "View Period" dropdown
2. Select previous month (if available)
3. Verify: Table updates with archived data ✅
4. Verify: "New Entry" button hidden ✅
5. Click "Print" to print historical data ✅

## Important Notes

⚠️ **Before Using:**
1. Run `MONTHLY_TRACKING_MIGRATION.sql` on your database
2. Restart your application
3. Reload station pages in browser

📌 **Data Preservation:**
- Old usage data from previous releases is NOT automatically cleaned
- Only archives new data going forward
- Historical data accessible for 3 months

💾 **Backup Recommendation:**
- Print/export month-end data before clicking "New Entry"
- Archives are in database but print provides audit trail

## Support

If issues occur:
- Check browser console for errors
- Verify database migration ran successfully
- Check API endpoint is accessible: `/api/station-monthly-entry`
- Ensure fetchJson import is present in component files
