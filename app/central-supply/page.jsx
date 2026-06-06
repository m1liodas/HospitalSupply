'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, Send, Package } from 'lucide-react'
import { fetchJson } from '@/lib/fetcher'
import AddItemModal from './add-item-modal'
import EditItemModal from './edit-item-modal'
import ReleaseSupplyModal from './release-supply-modal'
import ResupplyModal from './resupply-modal'

export default function CentralSupplyPage() {
  const router = useRouter()

  const [items, setItems] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showReleaseModal, setShowReleaseModal] = useState(false)
  const [showResupplyModal, setShowResupplyModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')

  // ✅ PAGINATION
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('loggedIn')
    const userRole = localStorage.getItem('userRole')

    if (!isLoggedIn) {
      router.push('/LoginSignup')
      return
    }

    if (userRole && userRole !== 'admin') {
      const stationSlug = String(userRole).toLowerCase().replace(/\s+/g, '-')
      router.push(`/stations/${encodeURIComponent(stationSlug)}`)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsData, invData] = await Promise.all([
        fetchJson('/api/items'),
        fetchJson('/api/inventory'),
      ])

      setItems(Array.isArray(itemsData) ? itemsData : [])
      setInventory(Array.isArray(invData) ? invData : [])
      setError('')
    } catch (error) {
      console.error('Central supply fetch error:', error)
      setError('Failed to load central supply data. Please refresh.')
      setItems([])
      setInventory([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      await fetchJson(`/api/items/${id}`, { method: 'DELETE' })
      await fetchData()
    } catch (error) {
      console.error('Delete item error:', error)
      setError('Unable to delete item. Please try again.')
    }
  }

  const handleAddItem = async (formData) => {
    try {
      await fetchJson('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      await fetchData()
      setShowAddModal(false)
    } catch (error) {
      console.error('Add item error:', error)
      setError('Unable to add item. Please try again.')
    }
  }

  const handleEditItem = async (formData) => {
    if (!selectedItem) return

    try {
      await fetchJson(`/api/items/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      await fetchData()
      setShowEditModal(false)
      setSelectedItem(null)
    } catch (error) {
      console.error('Edit item error:', error)
      setError('Unable to update item. Please try again.')
    }
  }

  // reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortOrder])

  // filtered + sorted
  const filteredItems = items
    .filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      return sortOrder === 'asc'
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName)
    })

  // ✅ SAFE pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages])

  const safePage = Math.min(Math.max(currentPage, 1), totalPages)

  const startIndex = (safePage - 1) * itemsPerPage

  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-foreground/60 text-xs">Loading supplies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="p-8 max-w-450 mx-auto">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Central Supply Management
            </h1>
            <p className="text-foreground/60 text-sm">
              Manage inventory items and distribution
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>

            <Button variant="outline" onClick={() => setShowReleaseModal(true)}>
              <Send className="w-4 h-4 mr-2" />
              Release Supplies
            </Button>
          </div>
        </div>

        {/* TABLE CARD */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center gap-4">
              <div>
                <CardTitle>Available Items</CardTitle>
                <CardDescription className="text-xs">
                  Total items: {filteredItems.length}
                </CardDescription>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border rounded-lg text-xs"
                >
                  Sort A-Z {sortOrder === 'asc' ? '↑' : '↓'}
                </button>

                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="px-3 py-2 border rounded-lg text-xs"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-left">Brand</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-left">Expiration</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/40">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">{item.brand}</td>
                      <td className="p-3 text-right">{item.quantity || 0}</td>
                      <td className="p-3 text-right">₱{item.selling_price}</td>
                      <td className="p-3">{item.expiration_date}</td>

                      <td className="p-3">
                        <div className="flex justify-center gap-2">

                          <button onClick={() => {
                            setSelectedItem(item)
                            setShowResupplyModal(true)
                          }}>
                            <Package className="w-4 h-4" />
                          </button>

                          <button onClick={() => {
                            setSelectedItem(item)
                            setShowEditModal(true)
                          }}>
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* EMPTY */}
            {paginatedItems.length === 0 && (
              <div className="text-center py-6 text-xs text-foreground/60">
                No items found
              </div>
            )}

            {/* PAGINATION */}
            <div className="flex justify-between items-center mt-6 text-xs">
              <p>
                {filteredItems.length === 0
                  ? "0 items"
                  : `Showing ${startIndex + 1}–${Math.min(startIndex + itemsPerPage, filteredItems.length)} of ${filteredItems.length}`
                }
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Prev
                </button>

                <span className="px-3 py-1 border bg-primary text-white rounded">
                  {safePage}
                </span>

                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

          </CardContent>
        </Card>

      </main>

      {/* MODALS */}
      {showAddModal && <AddItemModal onClose={() => setShowAddModal(false)} onSubmit={handleAddItem} />}
      {showEditModal && selectedItem && (
        <EditItemModal
          item={selectedItem}
          onClose={() => {
            setShowEditModal(false)
            setSelectedItem(null)
          }}
          onSubmit={handleEditItem}
        />
      )}
      {showResupplyModal && selectedItem && (
        <ResupplyModal
          item={selectedItem}
          onClose={() => {
            setShowResupplyModal(false)
            setSelectedItem(null)
          }}
          onSubmit={fetchData}
        />
      )}
      {showReleaseModal && (
        <ReleaseSupplyModal
          onClose={() => setShowReleaseModal(false)}
          items={items}
          inventory={inventory}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}