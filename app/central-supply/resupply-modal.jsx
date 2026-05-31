'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ResupplyModal({ item, onClose, onSubmit }) {
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!quantity || parseInt(quantity) <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: parseInt(quantity),
          action: 'add', // Signal that we're adding to existing quantity
          notes: notes,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(`Successfully added ${quantity} units to ${item.name}`)
        onSubmit()
        onClose()
      } else {
        alert(data.message || 'Failed to update quantity')
      }
    } catch (error) {
      console.error('Failed to resupply item:', error)
      alert('Error updating item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            Re-supply: {item.name}
          </h2>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-foreground/70">Current Stock</p>
          <p className="text-2xl font-bold text-primary">{item.quantity} pcs</p>
          <p className="text-xs text-foreground/60 mt-1">Brand: {item.brand}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Quantity to Add
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {quantity && (
              <p className="text-xs text-foreground/60 mt-1">
                New total: {parseInt(item.quantity) + parseInt(quantity)} pcs
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., New delivery from supplier..."
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Supply'}
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
