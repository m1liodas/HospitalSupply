'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, Send } from 'lucide-react'
import AddItemModal from './add-item-modal'
import EditItemModal from './edit-item-modal'
import ReleaseSupplyModal from './release-supply-modal'

export default function CentralSupplyPage() {
  const [items, setItems] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showReleaseModal, setShowReleaseModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchData()
  }, [])

  const fetchItems = async () => {
    const res = await fetch('/api/items')
    const data = await res.json()
    setItems(data)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, invRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/inventory'),
      ])
      
      if (!itemsRes.ok) throw new Error(`Items API error: ${itemsRes.status}`)
      if (!invRes.ok) throw new Error(`Inventory API error: ${invRes.status}`)
      
      const itemsData = await itemsRes.json()
      const invData = await invRes.json()
      setItems(itemsData)
      setInventory(invData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (formData) => {
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        fetchData()
        setShowAddModal(false)
      }
    } catch (error) {
      console.error('Failed to add item:', error)
    }
  }

  const handleEditItem = async (formData) => {
    if (!selectedItem) return
    try {
      const res = await fetch(`/api/items/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        fetchData()
        setShowEditModal(false)
        setSelectedItem(null)
      }
    } catch (error) {
      console.error('Failed to edit item:', error)
    }
  }

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-foreground/60">Loading supplies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="p-8 max-w-450 mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Central Supply Management</h1>
            <p className="text-foreground/60">Manage inventory items and distribute supplies to stations</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
            <Button
              onClick={() => setShowReleaseModal(true)}
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10"
            >
              <Send className="w-4 h-4 mr-2" />
              Release Supplies
            </Button>
          </div>
        </div>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Available Items</CardTitle>
                <CardDescription>Total items in inventory: {items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).length}</CardDescription>
              </div>
              <div className="flex gap-3">
                {/* Sort Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-border rounded-lg bg-background hover:bg-muted text-foreground text-sm font-medium transition-colors"
                  >
                    Sort A-Z {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
                
                {/* Search Box */}
                <div className="w-64">
                  <input
                    type="text"
                    placeholder="Search items by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Item Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Brand</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Quantity</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Selling Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Expiration</th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items
                    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .sort((a, b) => {
                      const nameA = a.name.toLowerCase();
                      const nameB = b.name.toLowerCase();
                      return sortOrder === 'asc' 
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                    })
                    .map((item) => {
                      const inv = inventory.find(i => i.item_id === item.id)
                      return (
                        <tr key={item.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-foreground">{item.name}</td>
                          <td className="py-3 px-4 text-foreground/80">{item.brand}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                              {item.quantity || 0} pcs
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-foreground/80">₱{item.selling_price}</td>
                          <td className="py-3 px-4">
                            <span className={`text-sm ${
                              new Date(item.expiration_date) < new Date()
                                ? 'text-destructive font-semibold'
                                : 'text-foreground/60'
                            }`}>
                              {item.expiration_date}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(item)
                                  setShowEditModal(true)
                                }}
                                className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4 text-primary" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-2 hover:bg-destructive/20 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  {searchQuery && items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 px-4 text-center text-foreground/60">
                        No items found matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

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
