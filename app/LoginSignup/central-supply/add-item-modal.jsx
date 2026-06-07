'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function AddItemModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    quantity: '',
    selling_price: '',
    expiration_date: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // ---------------- VALIDATION ----------------
    if (!formData.name.trim()) {
      toast.error('Item name is required')
      return
    }

    if (!formData.brand.trim()) {
      toast.error('Brand is required')
      return
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }

    if (!formData.selling_price || Number(formData.selling_price) <= 0) {
      toast.error('Selling price must be greater than 0')
      return
    }

    if (!formData.expiration_date) {
      toast.error('Expiration date is required')
      return
    }

    const selectedDate = new Date(formData.expiration_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      toast.error('Expiration date cannot be in the past')
      return
    }

    // convert numeric fields properly
    onSubmit({
      ...formData,
      quantity: Number(formData.quantity),
      selling_price: Number(formData.selling_price),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Add New Item</h2>
          <button onClick={onClose} className="text-foreground/60 hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Item Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Surgical Gloves"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Medline"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., 1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Selling Price (₱)</label>
            <input
              type="number"
              name="selling_price"
              value={formData.selling_price}
              onChange={handleChange}
              step="0.01"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Expiration Date</label>
            <input
              type="date"
              name="expiration_date"
              value={formData.expiration_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              Add Item
            </Button>

            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}