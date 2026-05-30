'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Package, DollarSign, Percent, AlertCircle, Edit2, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editingQuantity, setEditingQuantity] = useState('')
  

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

  const fetchSummary = async () => {
      try {
        const res = await fetch('/api/dashboard')
        const data = await res.json()
        setSummary(data)
      } catch (error) {
        console.error('Failed to fetch dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  const handleEdit = (itemId, currentQuantity) => {
    setEditingId(itemId)
    setEditingQuantity(currentQuantity.toString())
  }

  const handleSave = async (itemId) => {
    try {
      const newQuantity = parseInt(editingQuantity, 10)
      if (isNaN(newQuantity) || newQuantity < 0) {
        alert('Please enter a valid quantity')
        return
      }

      const res = await fetch(`/api/inventory/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (res.ok) {
        // Refresh the dashboard data
        const dashRes = await fetch('/api/dashboard')
        const data = await dashRes.json()
        setSummary(data)
        setEditingId(null)
      } else {
        alert('Failed to update quantity')
      }
    } catch (error) {
      console.error('Failed to update:', error)
      alert('Error updating quantity')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingQuantity('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-foreground/60">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-foreground/60">Overview of medical supply inventory and financials</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.total_items || 0}</div>
              <p className="text-xs text-muted-foreground">Different supply types</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{summary?.total_inventory_value.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Cost value in stock</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{summary?.total_income.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">From supplies used</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <Percent className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.total_profit_margin.toFixed(1) || 0}%</div>
              <p className="text-xs text-muted-foreground">Overall margin</p>
            </CardContent>
          </Card>
        </div>

        {/* Stations Overview with Editable Quantities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Station Supplies Overview</CardTitle>
            <CardDescription>Current supply status by station - Click edit to adjust quantities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary?.stations_overview.map((station) => (
                <div key={station.station_id} className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{station.station_name}</h3>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">{station.items_count} items</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/70">Remaining:</span>
                      <div className="flex items-center gap-2">
                        {editingId === `station_${station.station_id}` ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              value={editingQuantity}
                              onChange={(e) => setEditingQuantity(e.target.value)}
                              className="w-20 px-2 py-1 border border-border rounded bg-background text-foreground"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSave(`station_${station.station_id}`)}
                              className="p-1 hover:bg-primary/20 rounded transition"
                            >
                              <Check className="w-4 h-4 text-accent" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-1 hover:bg-destructive/20 rounded transition"
                            >
                              <X className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium text-foreground">{station.remaining_quantity} units</span>
                            <button
                              onClick={() => handleEdit(`station_${station.station_id}`, station.remaining_quantity)}
                              className="p-1 hover:bg-primary/20 rounded transition"
                            >
                              <Edit2 className="w-4 h-4 text-primary" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-foreground/70">
                      Cost Value: <span className="font-medium text-foreground">₱{station.cost_value.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Used Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Used Items</CardTitle>
              <CardDescription>Most utilized supplies this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary?.top_used_items.map((item) => (
                  <div key={item.item_id} className="flex items-between justify-between pb-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-foreground/60">Brand: {item.brand}</p>
                      <p className="text-sm text-foreground/60">{item.quantity_used} units used</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">₱{item.income.toLocaleString()}</p>
                      <p className="text-xs text-foreground/60">@ ₱{item.selling_price}/unit</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Items Near Expiration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Items Near Expiration
              </CardTitle>
              <CardDescription>Action needed soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary?.items_near_expiration.map((item) => (
                  <div key={item.id} className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <div className="flex justify-between items-end mt-1">
                      <p className="text-sm text-foreground/60">{item.quantity} units</p>
                      <p className="text-xs text-destructive font-semibold">{item.expiration_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
