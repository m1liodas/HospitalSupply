'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function EditItemModal({ item, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: item.name,
    brand: item.brand,
    quantity: item.quantity,
    selling_price: item.selling_price.toString(),
    expiration_date: item.expiration_date,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ---------------- VALIDATION ----------------
    if (!formData.name?.trim()) {
      toast.error('Item name is required')
      return
    }

    if (formData.quantity === '' || Number(formData.quantity) < 0) {
      toast.error('Quantity must be 0 or greater')
      return
    }

    if (!formData.selling_price || Number(formData.selling_price) <= 0) {
      toast.error('Selling price must be greater than 0')
      return
    }

    // OPTIONAL expiration validation
    if (formData.expiration_date) {
      const selectedDate = new Date(formData.expiration_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (!isNaN(selectedDate.getTime()) && selectedDate < today) {
        toast.error('Expiration date cannot be in the past')
        return
      }
    }

    setLoading(true)

    try {
      await onSubmit({
        ...formData,
        quantity: Number(formData.quantity),
        selling_price: Number(formData.selling_price),
        expiration_date: formData.expiration_date || null,
      })

      toast.success('Item updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Edit Item</h2>
          <button onClick={onClose} className="text-foreground/60 hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder="Item Name"
          />

          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder="Brand"
          />

          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder="Quantity"
          />

          <input
            type="number"
            name="selling_price"
            value={formData.selling_price}
            onChange={handleChange}
            step="0.01"
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder="Selling Price"
          />

          <input
            type="date"
            name="expiration_date"
            value={
              formData.expiration_date
                ? new Date(formData.expiration_date).toISOString().split('T')[0]
                : ''
            }
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
          />

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4">

            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {loading ? 'Updating...' : 'Update Item'}
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