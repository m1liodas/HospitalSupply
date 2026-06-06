<<<<<<< HEAD
import { NextResponse } from 'next/server'
import { loginUser, signupUser } from '@/lib/services/auth'
=======
import pool from '@/lib/db'
import { NextResponse } from 'next/server'
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb

export async function POST(req) {
  try {
    const body = await req.json()
<<<<<<< HEAD
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
=======

    const { action, username, password, role } = body

      // LOGIN
      if (action === 'login') {

        const [rows] = await pool.query(
          'SELECT * FROM users WHERE username = ? AND password = ?',
          [username, password]
        )

        if (rows.length > 0) {

          const user = rows[0]

          return NextResponse.json({
            success: true,
            message: 'Login successful',
            user: {
              id: user.id,
              username: user.username,
              role: user.role || 'admin'
            }
          })
        }

        // Check if trying to login with mock admin credentials
        if (username === 'admin' && password === 'admin') {
          return NextResponse.json({
            success: true,
            message: 'Login successful',
            user: {
              id: 1,
              username: 'admin',
              role: 'admin'
            }
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
          'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
          [username, password, role]
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
>>>>>>> 1d528fd1f74156d04c09d5007bcfb21e229acaeb
  }
}
