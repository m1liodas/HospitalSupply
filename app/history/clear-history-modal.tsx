'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, AlertTriangle, Calendar, Clock } from 'lucide-react'

type ClearType = 'all' | 'dateRange' | 'pastMonths'
type HistoryType = 'release' | 'resupply' | 'both'

interface ClearHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  onClear: (clearType: ClearType, historyType: HistoryType, startDate?: string, endDate?: string, months?: number) => Promise<void>
  isLoading?: boolean
  currentView: 'release' | 'resupply'
}

export default function ClearHistoryModal({
  isOpen,
  onClose,
  onClear,
  isLoading = false,
  currentView,
}: ClearHistoryModalProps) {
  const [clearType, setClearType] = useState<ClearType>('all')
  const [historyType, setHistoryType] = useState<HistoryType>(currentView === 'both' ? 'both' : (currentView as HistoryType))
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [months, setMonths] = useState('2')
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleClear = async () => {
    try {
      await onClear(clearType, historyType, startDate, endDate, months ? parseInt(months) : undefined)
      setShowConfirmation(false)
      setClearType('all')
      setHistoryType(currentView === 'both' ? 'both' : (currentView as HistoryType))
      setStartDate('')
      setEndDate(new Date().toISOString().split('T')[0])
      setMonths('2')
      onClose()
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }

  const getActionDescription = () => {
    let desc = `This will delete `
    if (clearType === 'all') {
      desc += 'all '
    } else if (clearType === 'dateRange') {
      desc += `records from ${startDate} to ${endDate}`
    } else if (clearType === 'pastMonths') {
      desc += `records from the past ${months} month${months !== '1' ? 's' : ''}`
    }

    if (historyType === 'both') {
      desc += 'release and resupply history records'
    } else {
      desc += `${historyType} history records`
    }

    desc += '. This action cannot be undone.'
    return desc
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl">
        <Card className="border-border shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-border">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Clear History</CardTitle>
                  <CardDescription className="mt-1">Choose how you want to clear your history records</CardDescription>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-foreground/50 hover:text-foreground text-xl"
              >
                ✕
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* History Type Selection */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block">
                  Select History Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'release', label: 'Release', icon: '📤' },
                    { id: 'resupply', label: 'Resupply', icon: '📥' },
                    { id: 'both', label: 'Both', icon: '🔄' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setHistoryType(option.id as HistoryType)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        historyType === option.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-muted/30 text-foreground hover:border-primary/50'
                      }`}
                    >
                      <div className="text-xl mb-2">{option.icon}</div>
                      <div className="text-xs font-semibold">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Type Selection */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block">
                  Clear Method
                </label>
                <div className="space-y-2">
                  {/* All */}
                  <label className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all" style={{borderColor: clearType === 'all' ? 'hsl(var(--primary))' : 'hsl(var(--border))', backgroundColor: clearType === 'all' ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted) / 0.3)'}}>
                    <input
                      type="radio"
                      name="clearType"
                      value="all"
                      checked={clearType === 'all'}
                      onChange={() => setClearType('all')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-foreground">Clear All Records</p>
                      <p className="text-xs text-foreground/60">Delete all history records permanently</p>
                    </div>
                  </label>

                  {/* Date Range */}
                  <label className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all" style={{borderColor: clearType === 'dateRange' ? 'hsl(var(--primary))' : 'hsl(var(--border))', backgroundColor: clearType === 'dateRange' ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted) / 0.3)'}}>
                    <input
                      type="radio"
                      name="clearType"
                      value="dateRange"
                      checked={clearType === 'dateRange'}
                      onChange={() => setClearType('dateRange')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Clear by Date Range
                      </p>
                      {clearType === 'dateRange' && (
                        <div className="mt-3 space-y-2">
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                            placeholder="From Date"
                          />
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                            placeholder="To Date"
                          />
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Past Months */}
                  <label className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all" style={{borderColor: clearType === 'pastMonths' ? 'hsl(var(--primary))' : 'hsl(var(--border))', backgroundColor: clearType === 'pastMonths' ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted) / 0.3)'}}>
                    <input
                      type="radio"
                      name="clearType"
                      value="pastMonths"
                      checked={clearType === 'pastMonths'}
                      onChange={() => setClearType('pastMonths')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Clear Past Months
                      </p>
                      {clearType === 'pastMonths' && (
                        <div className="mt-3">
                          <select
                            value={months}
                            onChange={(e) => setMonths(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                          >
                            {[1, 2, 3, 6, 12].map((m) => (
                              <option key={m} value={m}>
                                Last {m} month{m > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Warning Message */}
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Permanent Action</p>
                  <p className="text-xs text-red-700 mt-1">{getActionDescription()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-border">
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowConfirmation(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={isLoading || (clearType === 'dateRange' && (!startDate || !endDate))}
                >
                  {isLoading ? 'Clearing...' : 'Clear History'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getActionDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-sm text-foreground/80 font-semibold">
              Type &quot;DELETE&quot; to confirm:
            </p>
            <input
              type="text"
              placeholder="Type DELETE here"
              id="confirmInput"
              className="w-full px-3 py-2 mt-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                const input = document.getElementById('confirmInput') as HTMLInputElement
                if (input?.value === 'DELETE') {
                  handleClear()
                } else {
                  e.preventDefault()
                  alert('Please type DELETE to confirm')
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Clearing...' : 'Delete Records'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
