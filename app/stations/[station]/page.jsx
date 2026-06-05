'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ChevronLeft, ChevronRight, Printer, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchJson } from '@/lib/fetcher'
import './station.css'

const normalizeStation = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '-')

export default function ERStationPage() {
  const params = useParams()
  const router = useRouter()
  const station = params?.station
  const [releases, setReleases] = useState([])
  const [usages, setUsages] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ isOpen: false, day: null, itemId: null, type: null, currentValue: 0, itemName: '' })
  const [inputValue, setInputValue] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [availablePeriods, setAvailablePeriods] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const [isArchive, setIsArchive] = useState(false)
  const [archiveHistory, setArchiveHistory] = useState([])
  const POLL_INTERVAL_MS = 10000

  // Dynamic month/year and days
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthName = now.toLocaleString(undefined, { month: 'long' })
  
  // Get display month/year based on selected period
  const displayDate = selectedPeriod 
    ? new Date(selectedPeriod + '-01')
    : now
  
  const displayMonthName = displayDate.toLocaleString(undefined, { month: 'long' })
  const displayYear = displayDate.getFullYear()
  const daysInMonth = new Date(displayYear, displayDate.getMonth() + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    const loggedIn = localStorage.getItem('loggedIn')

    if (!loggedIn || !role) {
      router.push('/LoginSignup')
      return
    }

    if (role !== 'admin') {
      const roleSlug = normalizeStation(role)
      const currentStationSlug = normalizeStation(station)

      if (station && roleSlug !== currentStationSlug) {
        router.push(`/stations/${encodeURIComponent(roleSlug)}`)
        return
      }
    }

    if (station) {
      fetchAvailablePeriods()
      setLoading(true)
      fetchData()
      window.addEventListener('focus', fetchData)

      return () => {
        window.removeEventListener('focus', fetchData)
      }
    }
  }, [station, router])

  // Refetch data when selectedPeriod changes
  useEffect(() => {
    if (station && selectedPeriod) {
      setLoading(true)
      fetchData()
    }
  }, [selectedPeriod, station])

  // Handle polling based on archive state
  useEffect(() => {
    if (!station || isArchive) return
    
    const timer = setInterval(fetchData, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [station, isArchive])

  const fetchData = async () => {
    try {
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const targetPeriod = selectedPeriod || currentMonth

      const [releasesRes, usagesRes, itemsRes] = await Promise.all([
        fetch(`/api/stations-data/wards-stations/${station}`),
        fetch(`/api/usage?station=${encodeURIComponent(station)}&month_year=${encodeURIComponent(targetPeriod)}`),
        fetch('/api/items'),
      ])

      const errorResponse = async (res) => {
        const text = await res.text()
        throw new Error(`${res.url} returned ${res.status}: ${text.slice(0, 300)}`)
      }

      if (!releasesRes.ok) await errorResponse(releasesRes)
      if (!usagesRes.ok) await errorResponse(usagesRes)
      if (!itemsRes.ok) await errorResponse(itemsRes)

      const releasesData = await releasesRes.json()
      const usagesData = await usagesRes.json()
      const itemsData = await itemsRes.json()

      setReleases(releasesData)
      setUsages(usagesData.slice(0, daysInMonth))
      setItems(itemsData)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Failed to fetch data:', error)
      alert(`Failed to load station data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const isArchiveReadOnly = isArchive

  const openModal = (day, itemId, type, currentValue, itemName) => {
    setModal({ isOpen: true, day, itemId, type, currentValue, itemName })
    setInputValue(currentValue)
  }

  const closeModal = () => {
    setModal({ isOpen: false, day: null, itemId: null, type: null, currentValue: 0, itemName: '' })
  }

  const fetchAvailablePeriods = async () => {
    try {
      const data = await fetchJson(`/api/station-monthly-entry?station=${station}`)
      const uniquePeriods = Array.from(
        new Map(
          (data.periods || []).map(period => [
            period.month_year,
            period
          ])
        ).values()
      )

      setAvailablePeriods(uniquePeriods)
      setSelectedPeriod(data.currentMonth)
    } catch (error) {
      console.error('Failed to fetch periods:', error)
    }
  }

  const handleNewEntry = async () => {
    if (!window.confirm('Create new entry? This will archive the current month data and reset all AM/PM to 0. Quantity received and remaining will stay the same.')) {
      return
    }

    try {
      const result = await fetchJson('/api/station-monthly-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ station: normalizeStation(station) })
      })

      alert(result.message)
      await fetchAvailablePeriods()
      await fetchData()
    } catch (error) {
      console.error('Failed to create new entry:', error)
      alert(error.message || 'Failed to create new entry')
    }
  }

  const handlePrint = () => {
    const now = new Date()
    const reportDate = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    })

    let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Supply Usage Report - ${stationLabel} Station</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: white; padding: 20px; }
          .container { max-width: 1200px; margin: 0 auto; }
          
          .header {
            border-bottom: 3px solid #1f2937;
            padding-bottom: 20px;
            margin-bottom: 30px;
            text-align: center;
          }
          
          .header h1 { font-size: 28px; color: #1f2937; margin-bottom: 8px; font-weight: 600; }
          .header p { font-size: 14px; color: #6b7280; }
          .report-meta {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
          }
          
          .meta-item {
            text-align: center;
          }
          
          .meta-label { font-size: 12px; color: #9ca3af; text-transform: uppercase; font-weight: 600; }
          .meta-value { font-size: 16px; color: #1f2937; font-weight: 600; margin-top: 4px; }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          thead {
            background-color: #1f2937;
            color: white;
          }
          
          th {
            padding: 14px 10px;
            text-align: center;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid #1f2937;
          }
          
          th:first-child {
            text-align: left;
            width: 25%;
          }
          
          td {
            padding: 12px 10px;
            text-align: center;
            border: 1px solid #e5e7eb;
            font-size: 13px;
          }
          
          td:first-child {
            text-align: left;
            font-weight: 600;
            color: #1f2937;
            background-color: #f9fafb;
            width: 25%;
          }
          
          tbody tr:nth-child(odd) {
            background-color: #f9fafb;
          }
          
          tbody tr:hover {
            background-color: #f3f4f6;
          }
          
          .day-column { background-color: #eff6ff; }
          .day-header { background-color: #0284c7 !important; }
          
          .am { color: #0284c7; font-weight: 600; }
          .pm { color: #ea580c; font-weight: 600; }
          
          .summary {
            background-color: #f3f4f6;
            padding: 16px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 12px;
            color: #374151;
            border-left: 4px solid #1f2937;
          }
          
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 11px;
            color: #9ca3af;
          }
          
          @media print {
            body { padding: 0; }
            .container { max-width: 100%; }
            table { page-break-inside: avoid; }
            tr { page-break-inside: avoid; }
          }
          
          @page {
            margin: 0.5in;
            size: A4 landscape;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${stationLabel} Station - Daily Usage Report</h1>
            <p>Supply Management System - Official Record</p>
            <div class="report-meta">
              <div class="meta-item">
                <div class="meta-label">Report Date</div>
                <div class="meta-value">${reportDate}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Period</div>
                <div class="meta-value">${displayMonthName} ${displayYear}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Station</div>
                <div class="meta-value">${stationLabel}</div>
              </div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Qty Received</th>
                <th>Remaining</th>
                ${days.map(day => `<th class="day-header">Day ${day + 1}<br><small style="font-size: 11px;">AM/PM</small></th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${releases.map(release => `
                <tr>
                  <td>${release.name}</td>
                  <td>${release.quantity ?? release.quantity_released ?? 0}</td>
                  <td style="color: #0284c7; font-weight: 600;">${release.quantity_remaining ?? 0}</td>
                  ${days.map(day => {
                    const usage = usages.find(u =>
                      u.item_id === release.id &&
                      new Date(u.usage_date).getDate() === day + 1
                    );
                    const amQty = usage?.am_quantity || 0;
                    const pmQty = usage?.pm_quantity || 0;
                    return `<td class="day-column"><span class="am">${amQty}</span> / <span class="pm">${pmQty}</span></td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <strong>Report Summary:</strong><br>
            Total Items: ${releases.length} | Total Remaining Units: ${releases.reduce((sum, r) => sum + (r.quantity_remaining ?? 0), 0)} | 
            Report Generated: ${reportDate}
          </div>
          
          <div class="footer">
            <p>This is an official supply usage record for ${stationLabel} Station. Print date: ${new Date().toLocaleString()}</p>
            <p>For questions or discrepancies, contact supply management.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'height=600,width=1200');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  const changePeriod = (monthYear) => {
    setSelectedPeriod(monthYear)
    const period = availablePeriods.find(p => p.month_year === monthYear)
    setIsArchive(period?.isArchive || false)
  }

  const saveUsage = async () => {
    if (isArchive) {
      alert('Archive period is read-only. Select Current Month to add or update usage.')
      return
    }

    const { day, itemId, type } = modal

    try {
      // FIND EXISTING RECORD
      const existingUsage = usages.find(
        u =>
          u.item_id === itemId &&
          new Date(u.usage_date).getDate() === day + 1
      )

      // CREATE DATE using selected period or current year/month
      let year = displayYear
      let month = String(displayDate.getMonth() + 1).padStart(2, '0')
      const usageDate = `${year}-${month}-${String(day + 1).padStart(2, '0')}`

      // KEEP OTHER VALUE
      const amQty =
        type === 'am'
          ? inputValue
          : existingUsage?.am_quantity || 0

      const pmQty =
        type === 'pm'
          ? inputValue
          : existingUsage?.pm_quantity || 0

      const res = await fetch('/api/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          station: station,
          item_id: itemId,
          usage_date: usageDate,
          am_quantity: amQty,
          pm_quantity: pmQty,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // REFRESH DATA
        await fetchData()

        // CLOSE MODAL
        closeModal()

        alert(data.message)
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error(error)
      alert('Failed to save usage')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-foreground/60">Loading station data...</p>
        </div>
      </div>
    )
  }

  

  const STATION_LABELS = {
    dr: 'DR',
    er: 'ER',
    medicine: 'Medicine',
    nicu: 'NICU',
    'ob-gyne': 'OB-GYNE',
    opd: 'OPD',
    or: 'OR',
    pedia: 'PEDIA',
    surgical: 'Surgical',
  }

  const stationLabel = STATION_LABELS[station?.toLowerCase()] || (station || '').toUpperCase()

  

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="p-8 max-w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{stationLabel} Station Supply Tracking</h1>
          <p className="text-foreground/60">Daily AM/PM usage monitoring for {displayMonthName} {displayYear}</p>
          <p className="text-sm text-foreground/70">
            {isArchive 
              ? '📋 Viewing archive period - data is read-only'
              : `⚡ Auto refresh every 10s${lastUpdated ? ` · Updated ${lastUpdated}` : ''}`
            }
          </p>
        </div>

        {/* Month Navigation */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">View Period:</span>
                <select
                  value={selectedPeriod || ''}
                  onChange={(e) => changePeriod(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  {availablePeriods.map((period) => (
                    <option key={period.month_year} value={period.month_year}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                
                {!isArchive && (
                  <Button
                    onClick={handleNewEntry}
                    variant="default"
                    size="sm"
                    className="gap-2 bg-accent hover:bg-accent/90"
                  >
                    <RotateCcw className="w-4 h-4" />
                    New Entry
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-accent" />
              {`Daily Usage Tracking (${displayMonthName} 1-${daysInMonth})`}
            </CardTitle>
            <CardDescription>Enter AM/PM usage quantities and save to update inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="border border-border px-3 py-2 text-left font-semibold text-foreground sticky left-0 bg-muted/50 z-10 w-40">
                      Item Name
                    </th>
                    <th className="border border-border px-2 py-2 text-center font-semibold text-foreground w-16">
                      Qty Received
                    </th>
                    <th className="border border-border px-2 py-2 text-center font-semibold text-foreground w-16">
                      Remaining
                    </th>
                    {days.map((day) => (
                      <th key={day} className="border border-border px-1 py-2 text-center font-semibold text-foreground text-xs bg-primary/5 w-24">
                        <div>Day {day + 1}</div>
                        <div className="text-xs font-normal text-foreground/60">AM/PM</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {releases.map((release) => (
                    <tr key={release.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="border border-border px-3 py-2 font-medium text-foreground sticky left-0 bg-background z-10">
                        {release.name}
                      </td>
                      <td className="border border-border px-2 py-2 text-center text-foreground">
                        {release.quantity ?? release.quantity_released ?? 0}
                      </td>
                      <td className="border border-border px-2 py-2 text-center font-semibold text-primary">
                        {release.quantity_remaining ?? 0}
                      </td>
                      {days.map((day) => {
                        const usage = usages.find(
                          u =>
                            u.item_id === release.id &&
                            new Date(u.usage_date).getDate() === day + 1
                        )
                        return (
                          <td key={`${day}-${release.id}`} className="border border-border p-1">
                            <div className="flex gap-0.5">
                              <button
                                onClick={() => isArchiveReadOnly ? null : openModal(day, release.id, 'am', usage?.am_quantity || 0, release.name)}
                                className={`flex-1 px-1 py-1 rounded text-xs text-center font-medium transition-colors ${isArchiveReadOnly ? 'bg-slate-100 border border-slate-200 text-foreground/40 cursor-not-allowed' : 'bg-blue-50 border border-blue-200 hover:bg-blue-100 text-foreground/80 cursor-pointer'}`}
                              >
                                {usage?.am_quantity || 0}
                              </button>

                              <button
                                onClick={() => isArchiveReadOnly ? null : openModal(day, release.id, 'pm', usage?.pm_quantity || 0, release.name)}
                                className={`flex-1 px-1 py-1 rounded text-xs text-center font-medium transition-colors ${isArchiveReadOnly ? 'bg-slate-100 border border-slate-200 text-foreground/40 cursor-not-allowed' : 'bg-orange-50 border border-orange-200 hover:bg-orange-100 text-foreground/80 cursor-pointer'}`}
                              >
                                {usage?.pm_quantity || 0}
                              </button>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm text-foreground/70">
              <p className="font-medium mb-2">Instructions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Click on any AM/PM box to enter the quantity used during that shift</li>
                <li>A modal will appear for easy input, then save or cancel your changes</li>
                <li>Blue boxes = AM shift (morning), Orange boxes = PM shift (afternoon)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Supplies Released to DR</CardTitle>
            <CardDescription>Items available for this station</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {releases.map((release) => (
                <div key={release.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-2">{release.name}</h3>
                  <div className="space-y-1 text-sm text-foreground/70">
                    <div>Brand: <span className="text-foreground">{release.brand}</span></div>
                    <div>Qty Received: <span className="font-medium text-foreground">{release.quantity ?? release.quantity_released ?? 0} units</span></div>
                    <div>Remaining: <span className="font-medium text-primary">{release.quantity_remaining ?? 0} units</span></div>
                    <div>Date Received: <span className="text-foreground/60">{release.date_receive ? new Date(release.date_receive).toLocaleDateString() : release.released_at ? new Date(release.released_at).toLocaleDateString() : ''}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </main>

      {/* Edit Modal */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit {modal.type?.toUpperCase()} Usage</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-info">
                <p className="info-row"><span className="info-label">Day:</span> <span className="info-value">{modal.day + 1}</span></p>
                <p className="info-row"><span className="info-label">Item:</span> <span className="info-value">{modal.itemName}</span></p>
                <p className="info-row"><span className="info-label">Shift:</span> <span className="info-value">{modal.type?.toUpperCase()}</span></p>
              </div>
              
              <div className="modal-input-group">
                <label className="modal-label">Enter Quantity:</label>
                <input
                  type="number"
                  min="0"
                  value={inputValue}
                  onChange={(e) => setInputValue(parseInt(e.target.value) || 0)}
                  className="modal-input"
                  placeholder="0"
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn-save" onClick={saveUsage}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
