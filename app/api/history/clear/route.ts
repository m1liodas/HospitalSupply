import { NextRequest, NextResponse } from 'next/server'
import {
  clearAllHistory,
  clearHistoryByDateRange,
  clearHistoryPastMonths,
} from '@/lib/services/usage'
import {
  clearAllResupplyHistory,
  clearResupplyHistoryByDateRange,
  clearResupplyHistoryPastMonths,
} from '@/lib/services/resupply'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clearType, historyType, startDate, endDate, months } = body

    // Validate clearType
    if (!['all', 'dateRange', 'pastMonths'].includes(clearType)) {
      return NextResponse.json(
        { message: 'Invalid clear type' },
        { status: 400 }
      )
    }

    // Validate historyType
    if (!['release', 'resupply', 'both'].includes(historyType)) {
      return NextResponse.json(
        { message: 'Invalid history type' },
        { status: 400 }
      )
    }

    let deletedCount = 0

    try {
      // Handle release history
      if (historyType === 'release' || historyType === 'both') {
        if (clearType === 'all') {
          deletedCount += await clearAllHistory()
        } else if (clearType === 'dateRange') {
          if (!startDate || !endDate) {
            return NextResponse.json(
              { message: 'Start date and end date are required for date range' },
              { status: 400 }
            )
          }
          deletedCount += await clearHistoryByDateRange(startDate, endDate)
        } else if (clearType === 'pastMonths') {
          if (!months || months < 1) {
            return NextResponse.json(
              { message: 'Valid months value is required' },
              { status: 400 }
            )
          }
          deletedCount += await clearHistoryPastMonths(months)
        }
      }

      // Handle resupply history
      if (historyType === 'resupply' || historyType === 'both') {
        if (clearType === 'all') {
          deletedCount += await clearAllResupplyHistory()
        } else if (clearType === 'dateRange') {
          if (!startDate || !endDate) {
            return NextResponse.json(
              { message: 'Start date and end date are required for date range' },
              { status: 400 }
            )
          }
          deletedCount += await clearResupplyHistoryByDateRange(startDate, endDate)
        } else if (clearType === 'pastMonths') {
          if (!months || months < 1) {
            return NextResponse.json(
              { message: 'Valid months value is required' },
              { status: 400 }
            )
          }
          deletedCount += await clearResupplyHistoryPastMonths(months)
        }
      }
    } catch (serviceError) {
      console.error('[API] Service error during clear:', serviceError)
      return NextResponse.json(
        { message: 'Failed to clear history' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'History cleared successfully',
        deletedCount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API] Clear history error:', error)
    return NextResponse.json(
      { message: 'Failed to process clear history request' },
      { status: 500 }
    )
  }
}
