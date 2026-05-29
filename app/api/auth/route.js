import pool from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()

    const { action, username, password } = body

    // LOGIN
    if (action === 'login') {

      const [rows] = await pool.query(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password]
      )

      if (rows.length > 0) {
        return NextResponse.json({
          success: true,
          message: 'Login successful',
          user: rows[0]
        })
      }

      return NextResponse.json({
        success: false,
        message: 'Invalid username or password'
      })
    }

    // SIGNUP
    if (action === 'signup') {

      const [existing] = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      )

      if (existing.length > 0) {
        return NextResponse.json({
          success: false,
          message: 'Username already exists'
        })
      }

      await pool.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, password]
      )

      return NextResponse.json({
        success: true,
        message: 'Account created successfully'
      })
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action'
    })

  } catch (error) {

    console.log(error)

    return NextResponse.json({
      success: false,
      message: 'Server error'
    })
  }
}