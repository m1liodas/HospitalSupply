'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ReleaseSupplyModal({
  onClose,
  items,
  inventory,
  onSuccess,
}) {

  const [stations, setStations] = useState([])
  const [selectedStation, setSelectedStation] = useState('')
  const [releaseItems, setReleaseItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [itemSearches, setItemSearches] = useState({})
  const [openDropdown, setOpenDropdown] = useState(null)

  useEffect(() => {
    fetchStations()
  }, [])

  const fetchStations = async () => {

    try {

      const res = await fetch('/api/stations')

      const data = await res.json()

      setStations(data)

    } catch (error) {

      console.error('Failed to fetch stations:', error)

    } finally {

      setLoading(false)
    }
  }

  const addItem = () => {

    setReleaseItems([
      ...releaseItems,
      {
        item_id: '',
        quantity: 0,
        quantity_remaining: 0,
      },
    ])
  }

  const removeItem = (index) => {

    setReleaseItems(
      releaseItems.filter((_, i) => i !== index)
    )
  }

  const updateItem = (index, field, value) => {

    const updated = [...releaseItems]

    if (field === 'item_id') {

      const selectedItem = items.find(
        i => i.id === Number(value)
      )

      updated[index] = {
        ...updated[index],
        item_id: value,
        quantity: 1,
        quantity_remaining: selectedItem?.quantity || 0,
      }

    } else {

      updated[index][field] = parseInt(value) || 0
    }

    setReleaseItems(updated)
  }

  const handleItemSearch = (index, searchText) => {
    setItemSearches({ ...itemSearches, [index]: searchText })
  }

  const getFilteredItems = (index) => {
    const searchText = itemSearches[index] || ''
    if (!searchText) return items
    return items.filter(
      i =>
        i.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (i.brand && i.brand.toLowerCase().includes(searchText.toLowerCase()))
    )
  }

  const selectItemFromDropdown = (index, itemId, itemName, itemQty) => {
    updateItem(index, 'item_id', itemId)
    setItemSearches({ ...itemSearches, [index]: itemName })
    setOpenDropdown(null)
  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    if (!selectedStation) {
      alert('Please select a station')
      return
    }

    if (releaseItems.length === 0) {
      alert('Please add at least one item')
      return
    }

    for (const item of releaseItems) {

      if (!item.item_id) {
        alert('Please select an item')
        return
      }

      if (item.quantity <= 0) {
        alert('Quantity must be greater than 0')
        return
      }

      if (item.quantity > item.quantity_remaining) {
        alert('Quantity exceeds available stock')
        return
      }
    }

    try {
      const stationObj = stations.find(s => s.id === Number(selectedStation))
      const stationSlug = stationObj ? String(stationObj.name).toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-') : null

      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          station: stationSlug,
          items: releaseItems,
        }),
      })

      const data = await res.json()

      if (res.ok) {

        alert(data.message || 'Supplies released successfully')

        setReleaseItems([])

        setSelectedStation('')

        if (onSuccess) {
          await onSuccess()
        }

        onClose()

      } else {

        alert(data.message || 'Failed to release supplies')
      }

    } catch (error) {

      console.log('RELEASE ERROR:', error)

      alert(error.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-6 sticky top-0 bg-card">
          <h2 className="text-xl font-bold text-foreground">
            Release Supplies to Station
          </h2>

          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Station
            </label>

            <select
              value={selectedStation}
              onChange={(e) =>
                setSelectedStation(Number(e.target.value))
              }
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Choose a station...</option>

              {stations.map((station) => (
                <option
                  key={station.id}
                  value={station.id}
                >
                  {station.name} - {station.location}
                </option>
              ))}
            </select>
          </div>

          <div>

            <div className="flex items-center justify-between mb-3">

              <label className="block text-sm font-medium text-foreground">
                Items to Release
              </label>

              <Button
                type="button"
                onClick={addItem}
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>

            </div>

            <div className="space-y-4 overflow-y-auto">

              {releaseItems.map((item, index) => (

                <div
                  key={index}
                  className="p-3 bg-muted/50 rounded-lg border border-border"
                >

                  <div className="grid grid-cols-2 gap-3 mb-2">

                    <div>

                      <label className="block text-xs font-medium text-foreground/70 mb-1">
                        Item
                      </label>

                      <input
                        type="text"
                        placeholder="Search item..."
                        value={itemSearches[index] || ''}
                        onChange={(e) => {
                          handleItemSearch(index, e.target.value)
                          setOpenDropdown(index)
                        }}
                        onFocus={() => setOpenDropdown(index)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />

                      {openDropdown === index && (
                        <div className="bg-background border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto mt-1">
                          {getFilteredItems(index).length > 0 ? (
                            getFilteredItems(index).map((i) => (
                              <button
                                key={i.id}
                                type="button"
                                onClick={() => selectItemFromDropdown(index, i.id, i.name, i.quantity)}
                                className={`w-full text-left px-3 py-2 text-sm border-b border-border/30 last:border-b-0 transition-colors ${
                                  item.item_id === i.id
                                    ? 'bg-primary/20 text-primary font-medium'
                                    : 'hover:bg-muted/50 text-foreground'
                                }`}
                              >
                                <div className="font-medium">{i.name}</div>
                                <div className="text-xs text-foreground/60">Brand: {i.brand || 'N/A'} | Stock: {i.quantity}</div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-foreground/60">No items found</div>
                          )}
                        </div>
                      )}

                    </div>

                    <div>

                      <label className="block text-xs font-medium text-foreground/70 mb-1">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        max={item.quantity_remaining || 1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            'quantity',
                            e.target.value
                          )
                        }
                        required
                        disabled={!item.quantity_remaining}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />

                    </div>

                  </div>

                  <div className="flex items-center justify-between">

                    <div className="text-xs font-medium">
                      Available Stock:
                      <span className="text-primary ml-1">
                        {item.quantity_remaining || 0} pcs
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 hover:bg-destructive/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>

                  </div>

                  {item.quantity > item.quantity_remaining && (
                    <p className="text-xs text-red-500 mt-2">
                      Quantity exceeds available stock
                    </p>
                  )}

                </div>

              ))}

            </div>

            {releaseItems.length === 0 && (
              <p className="text-sm text-foreground/60 p-3 text-center">
                No items added yet. Click "Add Item" to begin.
              </p>
            )}

          </div>

          <div className="flex gap-3 pt-4 border-t border-border">

            <Button
              type="submit"
              disabled={
                !selectedStation ||
                releaseItems.length === 0
              }
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              Release Supplies
            </Button>

            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>

          </div>

        </form>

      </div>

    </div>
  )
}
