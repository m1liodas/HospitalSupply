# MedSupply - Medical Inventory Management System

A comprehensive hospital medical supply inventory management system built with Next.js 16 and React. The system manages supply distribution from a central supply facility to multiple hospital stations, with daily usage tracking, financial metrics, and comprehensive audit reports.

## Features

### 1. Dashboard
- **Real-time Overview**: View total items in stock, inventory cost value, total income, and profit margins
- **Station Summary**: Quick status of remaining supplies and cost values across all 9 hospital stations (ER, OB-GYNE, OR, DR, PEDIA, MEDICINE, SURGICAL, OPD, NICU)
- **Financial Metrics**: Track cost value of inventory, income from supplies used, and profit margins
- **Analytics**: Top used items and items near expiration alerts

### 2. Central Supply Management
- **Add/Edit/Delete Items**: Full CRUD operations for supply items
- **Inventory Tracking**: Monitor quantity in stock for all items
- **Pricing Management**: Set cost and selling prices for financial tracking
- **Batch Release**: Release multiple items to stations in a single transaction
- **Supply Visibility**: Table view of all items with expiration dates and current quantities

### 3. Station Pages
- **ER Station (Implemented)**: Complete template for daily usage tracking
- **31-Day Usage Grid**: AM/PM hourly usage tracking for each day of the month
- **Real-time Calculations**: Auto-calculate remaining supplies as usage is entered
- **Manual Confirmation**: Ensure accuracy with manual review before updating inventory
- **Color-coded Shifts**: Blue boxes for AM shifts, orange boxes for PM shifts
- **Release History**: View all supplies released to the station

### 4. History & Audit
- **Supply Release Log**: Complete audit trail of all supply releases with dates and quantities
- **Monthly Audit Reports**: Generate detailed reports showing:
  - Quantities used per station and item
  - Remaining quantities
  - Cost values and income calculations
  - Profit margin percentages
- **Print Functionality**: Professional print layout optimized for A4 paper
- **Filter & Export**: Filter by month and station for specific reports

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **UI Components**: Shadcn/ui with Tailwind CSS
- **API**: Next.js API Routes (mock backend for demonstration)
- **Styling**: Professional medical aesthetic with blue/teal color scheme
- **Icons**: Lucide React icons
- **Print**: React-to-Print for report generation

## Project Structure

```
├── app/
│   ├── api/                          # Backend API routes
│   │   ├── items/                    # Item CRUD endpoints
│   │   ├── inventory/                # Inventory management
│   │   ├── stations/                 # Hospital stations
│   │   ├── releases/                 # Supply release tracking
│   │   ├── usage/                    # Daily usage tracking
│   │   ├── history/                  # Audit reports
│   │   └── dashboard/                # Dashboard data
│   ├── dashboard/                    # Dashboard page
│   ├── central-supply/               # Central supply management
│   │   ├── page.tsx                  # Main page
│   │   ├── add-item-modal.tsx        # Add item form
│   │   ├── edit-item-modal.tsx       # Edit item form
│   │   └── release-supply-modal.tsx  # Batch release form
│   ├── stations/                     # Station pages
│   │   ├── page.tsx                  # Stations listing
│   │   └── er/                       # ER station (template)
│   ├── history/                      # History & audit page
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home (redirects to dashboard)
│   └── globals.css                   # Global styles
├── components/
│   ├── navigation.tsx                # Navigation bar
│   └── ui/                           # Shadcn/ui components
├── lib/
│   ├── db-schema.ts                  # TypeScript interfaces for database schema
│   ├── mock-data.ts                  # Mock data for development
│   └── utils.ts                      # Utility functions
└── public/                           # Static assets
```

## Installation & Running

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)

### Setup

1. **Install dependencies**:
```bash
pnpm install
```

2. **Run development server**:
```bash
pnpm dev
```

3. **Open in browser**:
```
http://localhost:3000
```

The app automatically redirects to `/dashboard`.

## Key Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/dashboard` | Overview of inventory and financial metrics |
| Central Supply | `/central-supply` | Manage items and release supplies |
| Stations | `/stations` | List of all hospital stations |
| ER Station | `/stations/er` | Daily usage tracking (template for all stations) |
| History & Audit | `/history` | Supply release logs and monthly reports |

## API Endpoints (Mock)

All API responses return JSON and use mock data. In production, these would connect to a Laravel backend.

### Items
- `GET /api/items` - List all items
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Inventory
- `GET /api/inventory` - Get all inventory
- `PUT /api/inventory` - Update quantity

### Stations
- `GET /api/stations` - List all stations

### Supply Releases
- `GET /api/releases` - List all releases
- `POST /api/releases` - Batch release supplies

### Daily Usage
- `GET /api/usage` - Get usage records (with filters)
- `POST /api/usage` - Confirm daily usage and update inventory

### History
- `GET /api/history` - Get audit records
- `POST /api/history` - Generate monthly report

### Dashboard
- `GET /api/dashboard` - Get dashboard summary data

## Database Schema

The system uses the following data model (see `LARAVEL_API_SETUP.md` for complete Laravel implementation):

- **Items**: Medical supplies with pricing and expiration dates
- **Inventory**: Current stock levels per item
- **Stations**: Hospital departments (ER, OB-GYNE, OR, etc.)
- **Supply Releases**: Audit trail of supplies distributed to stations
- **Daily Usages**: AM/PM usage tracking per station/item/day
- **History Records**: Monthly aggregated audit snapshots

## Key Business Logic

### Supply Release
When releasing supplies to a station:
1. Deduct quantity from central supply inventory
2. Create supply_releases record for audit trail
3. Initialize 31 daily_usages rows for tracking AM/PM usage

### Daily Usage Confirmation
When station staff confirm usage:
1. Validate total (AM + PM) doesn't exceed remaining
2. Calculate new remaining quantity
3. Mark usage as confirmed
4. Update inventory quantity

### Financial Calculations
- **Cost Value**: Remaining Quantity × Cost Price
- **Income**: Quantity Used × Selling Price
- **Profit**: Income - (Quantity Used × Cost Price)
- **Profit Margin**: (Profit / Income) × 100%

## Design Features

- **Professional Medical UI**: Blue and teal color scheme appropriate for healthcare
- **Responsive Tables**: Horizontal scrolling for large data sets
- **Modal Forms**: Confirmation dialogs for critical actions
- **Print Optimization**: Monthly reports formatted for A4 printing
- **Dark Mode Support**: Full dark mode theme included
- **Accessible**: Semantic HTML and ARIA labels throughout

## Laravel Integration

This Next.js frontend is designed to work with a Laravel backend. The complete Laravel implementation guide is provided in `LARAVEL_API_SETUP.md`, including:

- Database migrations
- Eloquent models
- API controllers
- Routes configuration
- Environment setup

To integrate with a Laravel backend:
1. Follow the setup in `LARAVEL_API_SETUP.md`
2. Update API endpoints in the components to point to your Laravel server
3. Replace mock data with real database queries

## Mock Data

For development, the system includes mock data for:
- 6 medical supply items
- 9 hospital stations
- Sample inventory and releases
- 31 days of usage data

All data is stored in memory and resets on server restart. To persist data, connect to a real database.

## Future Enhancements

- [ ] User authentication and role-based access
- [ ] Real-time inventory alerts
- [ ] Barcode scanning for releases
- [ ] Mobile app for station staff
- [ ] Advanced analytics and charts
- [ ] Integration with hospital ERP systems
- [ ] Email notifications for low stock
- [ ] Historical trend analysis
- [ ] Multi-language support
- [ ] Custom report builder

## Support

For issues, feature requests, or deployment help, refer to the implementation documentation in `LARAVEL_API_SETUP.md` or consult the v0.app documentation.

## License

This project is built with Next.js and follows the same licensing as the base framework.

---

Built with by v0.app - Medical Supply Inventory Management System
