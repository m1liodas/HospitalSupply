# MedSupply - Quick Start Guide

## 🚀 Getting Started in 30 Seconds

### 1. Install & Run
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### 2. Open in Browser
```
http://localhost:3000
```

The app automatically redirects to the Dashboard.

## 📱 Try These Features

### Dashboard (http://localhost:3000/dashboard)
- View inventory metrics: total items, cost value, income, profit margin
- See supplies remaining in each station
- Check top used items
- Get alerts on items near expiration

### Central Supply (http://localhost:3000/central-supply)
1. Click **"Add Item"** button
   - Enter: name, brand, cost price, selling price, expiration date
   - Click "Add Item"

2. Click **"Release Supplies"** button
   - Select station (ER, OB-GYNE, etc.)
   - Click "Add Item" to select multiple items
   - Enter quantities to release
   - Click "Release Supplies"

3. **Edit/Delete** items using the action buttons in the table

### ER Station (http://localhost:3000/stations/er)
- See all supplies released to ER
- **Track daily usage**:
  - Click any AM/PM box (blue=morning, orange=afternoon)
  - Enter quantity used
  - Click "Save" to update inventory
- Watch remaining supply update automatically

### Stations (http://localhost:3000/stations)
- View all 9 hospital stations
- Click any station card (only ER fully implemented as template)

### History & Audit (http://localhost:3000/history)
1. **View supply releases**
   - Complete audit trail of all distributions
   - Date, item, station, quantity, released by

2. **Generate monthly report**
   - Select month
   - Click "Generate Report"
   - View quantities used, remaining, cost, and profit

3. **Print report**
   - Click "Print" button
   - Professional A4 format
   - Includes financial summary

## 🔑 Key Pages Map

```
Dashboard          → Overview & metrics
Central Supply     → Add/Edit/Delete items, Release supplies
Stations           → Select ER (only one implemented)
  └─ ER Station    → Track daily AM/PM usage (31-day grid)
History & Audit    → Supply release log, Monthly audit reports
```

## 💡 How It Works

1. **Add Items** to Central Supply (with pricing)
2. **Release Supplies** in batches to stations
3. **Track Usage** daily at each station (AM/PM shifts)
4. **View Reports** with financial metrics
5. **Print Monthly** audits for compliance

## 📊 Mock Data Included

- **6 Items**: Surgical Gloves, Face Masks, IV Cannulas, Syringes, O₂ Masks, Gauze Pads
- **9 Stations**: ER, OB-GYNE, OR, DR, PEDIA, MEDICINE, SURGICAL, OPD, NICU
- **Sample Releases & Usage**: Ready to view and modify

## 🔗 API Endpoints

All endpoints are available at `/api/`:
- `/api/items` - Item management
- `/api/inventory` - Stock levels
- `/api/stations` - Hospital departments
- `/api/releases` - Supply distribution
- `/api/usage` - Daily usage tracking
- `/api/history` - Audit records
- `/api/dashboard` - Dashboard metrics

## 🎨 UI Features

- **Professional Medical Design**: Blue/teal color scheme
- **Dark Mode**: Full dark mode support (browser preference)
- **Responsive**: Works on desktop, tablet, mobile
- **Print Optimized**: Beautiful A4 format for reports
- **Real-time Calculations**: Remaining supply updates instantly

## 🛠 Development

### Project Structure
```
app/
├── dashboard/          # Main overview page
├── central-supply/     # Item management & releases
├── stations/          # Station list & ER tracking
├── history/           # Audit & reports
└── api/              # Backend endpoints
```

### Make Changes
- Edit any `.tsx` file and save
- Hot reload automatically updates browser
- No restart needed for most changes

## 📋 Next Steps

### For Local Testing
1. ✅ Already running - just add/release/track supplies
2. Open each page to test functionality
3. Add items and track usage to see calculations

### For Production
1. Follow `LARAVEL_API_SETUP.md` to set up backend
2. Connect to real database
3. Add user authentication
4. Deploy frontend to Vercel
5. Deploy backend to hosting

## ⚡ Quick Actions

| Action | Steps |
|--------|-------|
| Add Supply | Central Supply → "Add Item" → Fill form → Submit |
| Release to Station | Central Supply → "Release Supplies" → Select station & items → Confirm |
| Track Usage | Stations → ER → Click AM/PM box → Enter qty → "Save" |
| View Report | History → Select month → "Generate Report" → View table |
| Print Report | History → "Print" → Use browser print dialog |

## ❓ FAQ

**Q: Can I edit released supplies?**
A: No, releases are locked for audit. Create a new release for additional supplies.

**Q: Does data persist?**
A: Mock data resets on server restart. For persistence, set up Laravel backend.

**Q: How do I add more stations?**
A: Edit `/lib/mock-data.ts` to add station data. ER page is the template.

**Q: Is authentication included?**
A: Not yet. Add your own or wait for production setup guide.

**Q: Can I customize colors?**
A: Yes! Edit `/app/globals.css` to change design tokens.

## 🆘 Troubleshooting

**Port 3000 already in use?**
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
pnpm dev -- -p 3001
```

**Changes not showing?**
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
pnpm dev
```

**API endpoints return empty?**
- Check that dev server is running
- Verify URL is correct in browser
- Check console for errors (F12)

## 📚 Learn More

- **Full documentation**: See `README.md`
- **Implementation details**: See `IMPLEMENTATION_SUMMARY.md`
- **Laravel backend setup**: See `LARAVEL_API_SETUP.md`
- **Code structure**: Explore `/app` and `/lib` directories

---

**Ready to go!** Start with the Dashboard and explore each feature. 🎉
