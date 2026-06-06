'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, Download, FileText } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'

export default function HistoryPage() {
  const router = useRouter()
  const [auditHistory, setAuditHistory] = useState([])
<<<<<<< HEAD
  const [historyRows, setHistoryRows] = useState([])
=======
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [stationFilter, setStationFilter] = useState('')
  const printRef = useRef(null)
<<<<<<< HEAD
  const [view, setView] = useState('release') // 'release' or 'resupply'
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [total, setTotal] = useState(0)
=======
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('loggedIn')
    const userRole = localStorage.getItem('userRole')

    if (!isLoggedIn) {
      router.push('/LoginSignup')
      return
    }

    if (userRole && userRole !== 'admin') {
      const stationSlug = String(userRole)
        .toLowerCase()
        .replace(/\s+/g, '-')
      router.push(`/stations/${encodeURIComponent(stationSlug)}`)
      return
    }

    fetchAuditHistory()
  }, [startDate, endDate, stationFilter, router])

<<<<<<< HEAD
  useEffect(() => {
    fetchHistory()
  }, [startDate, endDate, stationFilter, view, page, pageSize])

  const fetchAuditHistory = async () => {
    try {
      setLoading(true)
      let url = `/api/audit-history?startDate=${startDate}&endDate=${endDate}&page=${page}&pageSize=${pageSize}`
=======
  const fetchAuditHistory = async () => {
    try {
      setLoading(true)
      let url = `/api/audit-history?startDate=${startDate}&endDate=${endDate}`
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
      if (stationFilter) {
        url += `&stationName=${stationFilter}`
      }

      const res = await fetch(url)
      const data = await res.json()
<<<<<<< HEAD
      // data: { rows, total }
      setAuditHistory(data.rows || [])
      setHistoryRows(data.rows || [])
      setTotal(data.total || (data.rows ? data.rows.length : 0))
    } catch (error) {
      console.error('Failed to fetch audit history:', error)
      setAuditHistory([])
      setHistoryRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      setLoading(true)
      if (view === 'release') {
        let url = `/api/audit-history?startDate=${startDate}&endDate=${endDate}&page=${page}&pageSize=${pageSize}`
        if (stationFilter) url += `&stationName=${stationFilter}`
        const res = await fetch(url)
        const data = await res.json()
        setHistoryRows(data.rows || [])
        setTotal(data.total || (data.rows ? data.rows.length : 0))
      } else {
        let url = `/api/resupply-history?startDate=${startDate}&endDate=${endDate}&page=${page}&pageSize=${pageSize}`
        const res = await fetch(url)
        const data = await res.json()
        // data: { rows, total }
        setHistoryRows(data.rows || [])
        setTotal(data.total || (data.rows ? data.rows.length : 0))
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
      setHistoryRows([])
      setTotal(0)
=======
      setAuditHistory(data || [])
    } catch (error) {
      console.error('Failed to fetch audit history:', error)
      setAuditHistory([])
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Audit Report ${startDate} to ${endDate}`,
  })

  const getStations = () => {
    const stations = new Set(auditHistory.map(h => h.station_name))
    return Array.from(stations).sort()
  }

  const getTotalStats = () => {
    return {
      totalReleases: auditHistory.length,
      totalQuantity: auditHistory.reduce((sum, h) => sum + h.quantity_released, 0),
      totalBefore: auditHistory.reduce((sum, h) => sum + h.quantity_before, 0),
      totalAfter: auditHistory.reduce((sum, h) => sum + h.quantity_after, 0),
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-foreground/60">Loading audit history...</p>
        </div>
      </div>
    )
  }

  const stats = getTotalStats()
  const stations = getStations()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Audit History & Reports</h1>
          <p className="text-foreground/60">Track all supply releases and generate audit reports</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters & Export</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Station</label>
                <select
                  value={stationFilter}
                  onChange={(e) => setStationFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">All Stations</option>
                  {stations.map((station) => (
                    <option key={station} value={station}>
                      {station}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handlePrint}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Report
                </Button>
<<<<<<< HEAD
                <select
                  value={view}
                  onChange={(e) => { setView(e.target.value); setPage(1) }}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="release">Release History</option>
                  <option value="resupply">Resupply History</option>
                </select>
=======
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {auditHistory.length > 0 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs text-foreground/60 uppercase font-semibold">Total Releases</p>
                  <p className="text-3xl font-bold text-primary mt-1">{stats.totalReleases}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs text-foreground/60 uppercase font-semibold">Total Quantity Released</p>
                  <p className="text-3xl font-bold text-accent mt-1">{stats.totalQuantity}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs text-foreground/60 uppercase font-semibold">Quantity Before</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.totalBefore}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs text-foreground/60 uppercase font-semibold">Quantity After</p>
                  <p className="text-3xl font-bold text-secondary mt-1">{stats.totalAfter}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit Table - Main Content for Print */}
        <div ref={printRef}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Supply Release Audit Log</CardTitle>
                  <CardDescription>
                    Records from {startDate} to {endDate}
                    {stationFilter && ` • Station: ${stationFilter}`}
                  </CardDescription>
                </div>
                <FileText className="w-6 h-6 text-foreground/40" />
              </div>
            </CardHeader>
            <CardContent>
<<<<<<< HEAD
              {historyRows.length === 0 ? (
=======
              {auditHistory.length === 0 ? (
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
                <div className="py-12 text-center">
                  <p className="text-foreground/60 mb-2">No records found</p>
                  <p className="text-sm text-foreground/40">
                    Try adjusting your date range or station filter
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Date & Time</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Item</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Brand</th>
<<<<<<< HEAD
                        {view === 'release' ? (
                          <>
                            <th className="text-left py-3 px-4 font-semibold text-foreground">Station</th>
                            <th className="text-center py-3 px-4 font-semibold text-foreground">Qty Released</th>
                            <th className="text-center py-3 px-4 font-semibold text-foreground">Before</th>
                            <th className="text-center py-3 px-4 font-semibold text-foreground">After</th>
                            <th className="text-left py-3 px-4 font-semibold text-foreground">Released By</th>
                          </>
                        ) : (
                          <>
                            <th className="text-center py-3 px-4 font-semibold text-foreground">Qty Added</th>
                            <th className="text-left py-3 px-4 font-semibold text-foreground">Notes</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {historyRows.map((record, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 text-foreground/80">
                            {view === 'release' ? new Date(record.released_at).toLocaleString() : new Date(record.added_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-medium text-foreground">{record.item_name}</td>
                          <td className="py-3 px-4 text-foreground/80">{record.item_brand || 'N/A'}</td>
                          {view === 'release' ? (
                            <>
                              <td className="py-3 px-4 text-foreground/80">
                                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                                  {record.station_name}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="bg-accent/10 text-accent px-2 py-1 rounded font-semibold">
                                  {record.quantity_released}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center text-foreground">{record.quantity_before}</td>
                              <td className="py-3 px-4 text-center font-semibold text-secondary">{record.quantity_after}</td>
                              <td className="py-3 px-4 text-foreground/80">{record.released_by}</td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 px-4 text-center">
                                <span className="bg-accent/10 text-accent px-2 py-1 rounded font-semibold">
                                  {record.quantity_added}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-foreground/80">{record.notes || ''}</td>
                            </>
                          )}
=======
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Station</th>
                        <th className="text-center py-3 px-4 font-semibold text-foreground">Qty Released</th>
                        <th className="text-center py-3 px-4 font-semibold text-foreground">Before</th>
                        <th className="text-center py-3 px-4 font-semibold text-foreground">After</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Released By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditHistory.map((record, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 text-foreground/80">
                            {new Date(record.released_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-medium text-foreground">{record.item_name}</td>
                          <td className="py-3 px-4 text-foreground/80">{record.item_brand || 'N/A'}</td>
                          <td className="py-3 px-4 text-foreground/80">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                              {record.station_name}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="bg-accent/10 text-accent px-2 py-1 rounded font-semibold">
                              {record.quantity_released}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-foreground">{record.quantity_before}</td>
                          <td className="py-3 px-4 text-center font-semibold text-secondary">{record.quantity_after}</td>
                          <td className="py-3 px-4 text-foreground/80">{record.released_by}</td>
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
                        </tr>
                      ))}
                    </tbody>
                  </table>
<<<<<<< HEAD
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-foreground/60">Total: {total}</div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        variant="outline"
                      >
                        Prev
                      </Button>
                      <div className="px-3 py-2 border border-border rounded-lg bg-background text-foreground">Page {page}</div>
                      <Button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page * pageSize >= total}
                        variant="outline"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
=======
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PRINT LAYOUT ONLY */}
        <div className="hidden">
          <div ref={printRef} className="bg-white text-black p-10">

            <div className="mb-8 border-b-2 border-black pb-4">
              <h1 className="text-[15px] font-bold">
                CENTRAL SUPPLY AUDIT REPORT
              </h1>

              <p className="mt-2 text-[11px]">
                Records from {startDate} to {endDate}
              </p>

              {stationFilter && (
                <p className="ext-[11px] mt-1">
                  Station: {stationFilter}
                </p>
              )}
            </div>

            <table className="w-full border-collapse text-[8px] table-fixed">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-1 py-1 text-left w-[18%]">Date</th>
                  <th className="border px-1 py-1 text-left w-[22%]">Item</th>
                  <th className="border px-1 py-1 text-left w-[16%]">Brand</th>
                  <th className="border px-1 py-1 text-left w-[16%]">Station</th>
                  <th className="border px-1 py-1 text-center w-[9%]">Qty</th>
                  <th className="border px-1 py-1 text-center w-[9%]">Before</th>
                  <th className="border px-1 py-1 text-center w-[10%]">After</th>
                </tr>
              </thead>

              <tbody>
                {auditHistory.map((record, index) => (
                  <tr key={index} className="align-top">
                    <td className="border px-1 py-1 wrap-break-words">
                      {new Date(record.released_at).toLocaleString()}
                    </td>

                    <td className="border px-1 py-1 font-semibold wrap-break-words">
                      {record.item_name}
                    </td>

                    <td className="border px-1 py-1 wrap-break-word">
                      {record.item_brand || 'N/A'}
                    </td>

                    <td className="border px-1 py-1 wrap-break-words">
                      {record.station_name}
                    </td>

                    <td className="border px-1 py-1 text-center">
                      {record.quantity_released}
                    </td>

                    <td className="border px-1 py-1 text-center">
                      {record.quantity_before}
                    </td>

                    <td className="border px-1 py-1 text-center">
                      {record.quantity_after}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between mt-16">
              <div>
                <p className="text-[11px] font-semibold">Prepared By:</p>
                <div className="w-52 border-b border-black mt-10"></div>
              </div>

              <div>
                <p className="text-[11px] font-semibold">Approved By:</p>
                <div className="w-52 border-b border-black mt-10"></div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  )
}
