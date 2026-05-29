'use client'

import { useEffect, useState, useRef } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, Download, Filter } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'

export default function HistoryPage() {
  const [releases, setReleases] = useState([])
  const [history, setHistory] = useState([])
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('2024-05')
  const [selectedStation, setSelectedStation] = useState(null)
  const printRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [selectedMonth, selectedStation])

  const fetchData = async () => {
    try {
      const [releasesRes, historyRes, stationsRes] = await Promise.all([
        fetch('/api/releases'),
        fetch(`/api/history?month=${selectedMonth}${selectedStation ? `&station_id=${selectedStation}` : ''}`),
        fetch('/api/stations'),
      ])

      const releasesData = await releasesRes.json()
      const historyData = await historyRes.json()
      const stationsData = await stationsRes.json()

      setReleases(releasesData)
      setHistory(historyData)
      setStations(stationsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Supply Audit Report ${selectedMonth}`,
  })

  const generateMonthlyReport = async () => {
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-foreground/60">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Supply History & Audit</h1>
          <p className="text-foreground/60">Track supply releases and generate monthly audit reports</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Station (Optional)</label>
                <select
                  value={selectedStation || ''}
                  onChange={(e) => setSelectedStation(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">All Stations</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={generateMonthlyReport}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Supply Release Log</CardTitle>
            <CardDescription>All supplies released to stations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Date & Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Item</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Station</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Released By</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {releases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-foreground/60">
                        No release records found
                      </td>
                    </tr>
                  ) : (
                    releases.map((release) => (
                      <tr key={release.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-foreground/80">
                          {new Date(release.released_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">{release.item?.name}</td>
                        <td className="py-3 px-4 text-foreground/80">{release.station?.name}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                            {release.quantity_released}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-foreground/80">{release.released_by}</td>
                        <td className="py-3 px-4">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                            {release.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div ref={printRef} className="print:p-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Audit Report - {selectedMonth}</CardTitle>
              <CardDescription>Supply usage and financial summary</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-foreground/60 py-8 text-center">
                  No audit records for this period. Click "Generate Report" to create one.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Station</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Item</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Used</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Remaining</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Cost Value</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Income</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Profit %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((record) => (
                        <tr key={record.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-foreground">{record.station?.name}</td>
                          <td className="py-3 px-4 text-foreground/80">{record.item?.name}</td>
                          <td className="py-3 px-4 text-right text-foreground">{record.quantity_used_total}</td>
                          <td className="py-3 px-4 text-right text-primary font-semibold">{record.quantity_remaining}</td>
                          <td className="py-3 px-4 text-right text-foreground/80">₱{record.cost_value.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-semibold text-secondary">₱{record.income_value.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="bg-accent/10 text-accent px-3 py-1 rounded-full font-semibold">
                              {record.profit_margin.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {history.length > 0 && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-foreground/60 uppercase font-semibold">Total Used</p>
                      <p className="text-2xl font-bold text-foreground">
                        {history.reduce((sum, h) => sum + h.quantity_used_total, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 uppercase font-semibold">Total Remaining</p>
                      <p className="text-2xl font-bold text-primary">
                        {history.reduce((sum, h) => sum + h.quantity_remaining, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 uppercase font-semibold">Total Cost Value</p>
                      <p className="text-2xl font-bold text-foreground">
                        ₱{history.reduce((sum, h) => sum + h.cost_value, 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 uppercase font-semibold">Total Income</p>
                      <p className="text-2xl font-bold text-secondary">
                        ₱{history.reduce((sum, h) => sum + h.income_value, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
