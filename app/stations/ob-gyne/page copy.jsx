'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Save, AlertCircle } from 'lucide-react'

const STATION_ID = 1 // ER

export default function ERStationPage() {
  const [releases, setReleases] = useState([])
  const [usages, setUsages] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCells, setEditingCells] = useState(new Set())
  const [tempValues, setTempValues] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [releasesRes, usagesRes, itemsRes] = await Promise.all([
        fetch(`/api/releases`),
        fetch(`/api/usage?station_id=${STATION_ID}`),
        fetch('/api/items'),
      ])

      const releasesData = await releasesRes.json()
      const usagesData = await usagesRes.json()
      const itemsData = await itemsRes.json()

      setReleases(releasesData.filter((r) => r.station_id === STATION_ID))
      setUsages(usagesData.slice(0, 31))
      setItems(itemsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEdit = (cellId, currentValue) => {
    const newEditing = new Set(editingCells)
    if (newEditing.has(cellId)) {
      newEditing.delete(cellId)
    } else {
      newEditing.add(cellId)
      setTempValues(prev => ({ ...prev, [cellId]: currentValue }))
    }
    setEditingCells(newEditing)
  }

  const updateValue = (cellId, value) => {
    setTempValues(prev => ({ ...prev, [cellId]: value }))
  }

  const saveUsage = async (day, itemId, type) => {
    const usage = usages[day]
    if (!usage) return

    const cellId = `${day}-${itemId}-${type}`
    const value = tempValues[cellId] || 0

    try {
      const res = await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id: STATION_ID,
          item_id: itemId,
          usage_date: usage.usage_date,
          am_quantity: type === 'am' ? value : usage.am_quantity,
          pm_quantity: type === 'pm' ? value : usage.pm_quantity,
          confirmed_by: 'Station Staff',
        }),
      })

      if (res.ok) {
        fetchData()
        setEditingCells(new Set(Array.from(editingCells).filter(c => c !== cellId)))
      }
    } catch (error) {
      console.error('Failed to save usage:', error)
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

  const days = Array.from({ length: 31 }, (_, i) => i)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="p-8 max-w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">ER Station Supply Tracking</h1>
          <p className="text-foreground/60">Daily AM/PM usage monitoring for May 2024</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Supplies Released to ER</CardTitle>
            <CardDescription>Items available for this station</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {releases.map((release) => (
                <div key={release.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-2">{release.item?.name}</h3>
                  <div className="space-y-1 text-sm text-foreground/70">
                    <div>Brand: <span className="text-foreground">{release.item?.brand}</span></div>
                    <div>Released: <span className="font-medium text-foreground">{release.quantity_released} units</span></div>
                    <div>Remaining: <span className="font-medium text-primary">{release.quantity_remaining} units</span></div>
                    <div>Date: <span className="text-foreground/60">{new Date(release.released_at).toLocaleDateString()}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-accent" />
              Daily Usage Tracking (May 1-31)
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
                        {release.item?.name}
                      </td>
                      <td className="border border-border px-2 py-2 text-center text-foreground">
                        {release.quantity_released}
                      </td>
                      <td className="border border-border px-2 py-2 text-center font-semibold text-primary">
                        {release.quantity_remaining}
                      </td>
                      {days.map((day) => {
                        const usage = usages[day]
                        return (
                          <td key={`${day}-${release.item_id}`} className="border border-border p-1">
                            <div className="flex gap-0.5">
                              <div className="flex-1">
                                {editingCells.has(`${day}-${release.item_id}-am`) ? (
                                  <div className="flex flex-col gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      value={tempValues[`${day}-${release.item_id}-am`] || 0}
                                      onChange={(e) =>
                                        updateValue(`${day}-${release.item_id}-am`, parseInt(e.target.value) || 0)
                                      }
                                      className="w-full px-1 py-1 border border-primary rounded text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                      placeholder="0"
                                    />
                                    <button
                                      onClick={() => saveUsage(day, release.item_id, 'am')}
                                      className="px-1 py-0.5 bg-primary/80 text-primary-foreground text-xs rounded hover:bg-primary transition-colors"
                                    >
                                      Save
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => toggleEdit(`${day}-${release.item_id}-am`, usage?.am_quantity || 0)}
                                    className="w-full px-1 py-1 bg-blue-50 border border-blue-200 rounded text-xs hover:bg-blue-100 text-center font-medium text-foreground/80 transition-colors cursor-pointer"
                                  >
                                    {usage?.am_quantity || 0}
                                  </button>
                                )}
                              </div>

                              <div className="flex-1">
                                {editingCells.has(`${day}-${release.item_id}-pm`) ? (
                                  <div className="flex flex-col gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      value={tempValues[`${day}-${release.item_id}-pm`] || 0}
                                      onChange={(e) =>
                                        updateValue(`${day}-${release.item_id}-pm`, parseInt(e.target.value) || 0)
                                      }
                                      className="w-full px-1 py-1 border border-primary rounded text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                      placeholder="0"
                                    />
                                    <button
                                      onClick={() => saveUsage(day, release.item_id, 'pm')}
                                      className="px-1 py-0.5 bg-primary/80 text-primary-foreground text-xs rounded hover:bg-primary transition-colors"
                                    >
                                      Save
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => toggleEdit(`${day}-${release.item_id}-pm`, usage?.pm_quantity || 0)}
                                    className="w-full px-1 py-1 bg-orange-50 border border-orange-200 rounded text-xs hover:bg-orange-100 text-center font-medium text-foreground/80 transition-colors cursor-pointer"
                                  >
                                    {usage?.pm_quantity || 0}
                                  </button>
                                )}
                              </div>
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
                <li>Click "Save" to confirm the usage and update remaining inventory</li>
                <li>Blue boxes = AM shift (morning), Orange boxes = PM shift (afternoon)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
