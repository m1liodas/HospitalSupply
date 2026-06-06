# Laravel API Setup for Medical Supply Inventory System

This document provides the Laravel backend implementation for the Medical Supply Inventory Management System. The current Next.js application uses mock API endpoints in `/app/api/` for demonstration.

## Database Schema

### 1. Items Table
```sql
CREATE TABLE items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    sku VARCHAR(255) UNIQUE,
    cost_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    expiration_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Inventory Table
```sql
CREATE TABLE inventory (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    item_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL,
    location VARCHAR(255),
    status ENUM('active', 'expired', 'depleted') DEFAULT 'active',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);
```

### 3. Stations Table
```sql
CREATE TABLE stations (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name ENUM('ER', 'OB-GYNE', 'OR', 'DR', 'PEDIA', 'MEDICINE', 'SURGICAL', 'OPD', 'NICU') UNIQUE NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4. Supply Releases Table
```sql
CREATE TABLE supply_releases (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    item_id BIGINT UNSIGNED NOT NULL,
    station_id BIGINT UNSIGNED NOT NULL,
    quantity_released INT NOT NULL,
    quantity_remaining INT NOT NULL,
    released_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);
```

### 5. Daily Usages Table
```sql
CREATE TABLE daily_usages (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    item_id BIGINT UNSIGNED NOT NULL,
    station_id BIGINT UNSIGNED NOT NULL,
    usage_date DATE NOT NULL,
    am_quantity INT DEFAULT 0,
    pm_quantity INT DEFAULT 0,
    quantity_remaining_after INT,
    status ENUM('pending', 'confirmed') DEFAULT 'pending',
    confirmed_by VARCHAR(255),
    confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_daily_usage (item_id, station_id, usage_date),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);
```

### 6. History Records Table
```sql
CREATE TABLE history_records (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    station_id BIGINT UNSIGNED NOT NULL,
    item_id BIGINT UNSIGNED NOT NULL,
    quantity_used_total INT,
    quantity_remaining INT,
    cost_value DECIMAL(12, 2),
    income_value DECIMAL(12, 2),
    profit_margin DECIMAL(5, 2),
    month VARCHAR(7), -- Format: YYYY-MM
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);
```

## Laravel Models

### Item Model
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $fillable = [
        'name', 'brand', 'sku', 'cost_price', 'selling_price', 'expiration_date'
    ];

    public function inventory()
    {
        return $this->hasOne(Inventory::class);
    }

    public function releases()
    {
        return $this->hasMany(SupplyRelease::class);
    }
}
```

### Inventory Model
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $fillable = ['item_id', 'quantity', 'location', 'status'];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
```

### Station Model
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Station extends Model
{
    protected $fillable = ['name', 'location'];

    public function releases()
    {
        return $this->hasMany(SupplyRelease::class);
    }

    public function usages()
    {
        return $this->hasMany(DailyUsage::class);
    }
}
```

### SupplyRelease Model
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplyRelease extends Model
{
    protected $fillable = [
        'item_id', 'station_id', 'quantity_released', 'quantity_remaining', 'released_by', 'status'
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function station()
    {
        return $this->belongsTo(Station::class);
    }
}
```

### DailyUsage Model
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyUsage extends Model
{
    protected $fillable = [
        'item_id', 'station_id', 'usage_date', 'am_quantity', 'pm_quantity',
        'quantity_remaining_after', 'status', 'confirmed_by', 'confirmed_at'
    ];

    protected $casts = [
        'usage_date' => 'date',
        'confirmed_at' => 'datetime',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function station()
    {
        return $this->belongsTo(Station::class);
    }
}
```

### HistoryRecord Model
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistoryRecord extends Model
{
    protected $fillable = [
        'station_id', 'item_id', 'quantity_used_total', 'quantity_remaining',
        'cost_value', 'income_value', 'profit_margin', 'month'
    ];

    public function station()
    {
        return $this->belongsTo(Station::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
```

## API Routes (routes/api.php)

```php
use App\Http\Controllers\ItemController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\StationController;
use App\Http\Controllers\SupplyReleaseController;
use App\Http\Controllers\DailyUsageController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function () {
    // Items
    Route::apiResource('items', ItemController::class);

    // Inventory
    Route::apiResource('inventory', InventoryController::class)->only(['index', 'update']);

    // Stations
    Route::apiResource('stations', StationController::class)->only(['index', 'show']);

    // Supply Releases
    Route::get('releases', [SupplyReleaseController::class, 'index']);
    Route::post('releases/batch', [SupplyReleaseController::class, 'batchRelease']);

    // Daily Usage
    Route::get('usage', [DailyUsageController::class, 'index']);
    Route::post('usage/confirm', [DailyUsageController::class, 'confirm']);

    // History
    Route::get('history', [HistoryController::class, 'index']);
    Route::post('history/generate', [HistoryController::class, 'generateMonthly']);

    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'summary']);
});
```

## Controllers - Example (ItemController)

```php
namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function index()
    {
        return Item::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'brand' => 'required|string',
            'sku' => 'required|unique:items',
            'cost_price' => 'required|numeric',
            'selling_price' => 'required|numeric',
            'expiration_date' => 'required|date',
        ]);

        return Item::create($validated);
    }

    public function show(Item $item)
    {
        return $item;
    }

    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'name' => 'string',
            'brand' => 'string',
            'cost_price' => 'numeric',
            'selling_price' => 'numeric',
            'expiration_date' => 'date',
        ]);

        $item->update($validated);
        return $item;
    }

    public function destroy(Item $item)
    {
        $item->delete();
        return response()->json(['message' => 'Item deleted']);
    }
}
```

## Key Implementation Notes

1. **Batch Release Logic**: When releasing supplies, create daily_usages records for the next 31 days
2. **Inventory Deduction**: Use database transactions when confirming usage to ensure consistency
3. **Financial Calculations**: 
   - Cost Value = quantity × cost_price
   - Income = quantity_used × selling_price
   - Profit = Income - (cost of items used)
4. **Audit Trail**: All release operations should be logged with user information

## Testing with Postman

Example POST request for batch release:
```json
POST /api/releases/batch
{
    "station_id": 1,
    "items": [
        {"item_id": 1, "quantity": 100},
        {"item_id": 2, "quantity": 50}
    ],
    "released_by": "Admin User"
}
```

## Environment Variables

Add to `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=medsupply
DB_USERNAME=root
DB_PASSWORD=
```

## Migration Files

Run migrations:
```bash
php artisan migrate
```

Each model should have corresponding migration files created using:
```bash
php artisan make:migration create_items_table
php artisan make:migration create_inventory_table
# ... etc for all tables
```

This Laravel API can be integrated with the Next.js frontend by updating the API endpoints in `/lib/api-config.ts` to point to the Laravel server URL.
