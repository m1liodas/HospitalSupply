'use client'

import { Button } from '@/components/ui/button'

export default function StationModal({
  modal,
  inputValue,
  setInputValue,
  onClose,
  onSave,
  saving
}) {
  if (!modal.isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md">

        <h2 className="text-lg font-bold mb-4">
          Update Usage
        </h2>

        <p className="mb-3">
          {modal.itemName}
        </p>

        <input
          type="number"
          min="0"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full border rounded px-3 py-2"
          autoFocus
        />

        <div className="flex gap-2 mt-4">

          <Button
            onClick={onSave}
            disabled={saving || inputValue === ''}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

        </div>

      </div>
    </div>
  )
}