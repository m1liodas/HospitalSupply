import db from '@/lib/db'

export interface User {
  id: number
  username: string
  role: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: User
}

/**
 * Login user with username and password
 */
export async function loginUser(
  username: string,
  password: string
): Promise<AuthResponse> {
  try {
    const [rows]: any = await db.execute(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    )

    if (rows && rows.length > 0) {
      const user = rows[0]
      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          role: user.role || 'admin',
        },
      }
    }

    return {
      success: false,
      message: 'Invalid username or password',
    }
  } catch (error) {
    console.error('[Services] Login error:', error)
    throw new Error('Login failed')
  }
}

/**
 * Create new user account
 */
export async function signupUser(
  username: string,
  password: string,
  role: string
): Promise<AuthResponse> {
  try {
    // Check if user already exists
    const [existing]: any = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    )

    if (existing && existing.length > 0) {
      return {
        success: false,
        message: 'Username already exists',
      }
    }

    // Insert new user
    await db.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, role]
    )

    return {
      success: true,
      message: 'Account created successfully',
    }
  } catch (error) {
    console.error('[Services] Signup error:', error)
    throw new Error('Signup failed')
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<User | null> {
  try {
    const [rows]: any = await db.execute('SELECT * FROM users WHERE id = ?', [
      userId,
    ])

    if (rows && rows.length > 0) {
      const user = rows[0]
      return {
        id: user.id,
        username: user.username,
        role: user.role || 'admin',
      }
    }

    return null
  } catch (error) {
    console.error('[Services] Get user error:', error)
    throw new Error('Failed to get user')
  }
}
