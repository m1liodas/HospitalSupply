import { NextResponse } from 'next/server'
import { loginUser, signupUser } from '@/lib/services/auth'

export async function POST(req) {
  try {
    const body = await req.json()
    const { action, username, password, role } = body

    if (!action || !username || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // LOGIN
    if (action === 'login') {
      const result = await loginUser(username, password)
      return NextResponse.json(result)
    }

    // SIGNUP
    if (action === 'signup') {
      const result = await signupUser(username, password, role || 'staff')
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[API] Auth error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
