'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import styles from './loginstyle.module.css'

import passwordIcon from '../../components/assets/padlock.png'
import userIcon from '../../components/assets/user.png'

export default function LoginSignup() {

  const router = useRouter()

  const [action, setAction] = useState('Login')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async () => {

    if (action === 'Sign Up') {

      if (password !== confirmPassword) {
        alert('Passwords do not match')
        return
      }

    }

    const response = await fetch('/api/auth', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({

        action: action.toLowerCase(),
        username,
        password

      }),

    })

    const data = await response.json()

    alert(data.message)

    if (data.success && action === 'Login') {

      localStorage.setItem(
        'loggedIn',
        'true'
      )

      router.push('/dashboard')

    }

    if (data.success && action === 'Sign Up') {

      setAction('Login')

      setUsername('')
      setPassword('')
      setConfirmPassword('')

    }

  }

  return (

    <div className={styles.loginPage}>

      <div className={styles.container}>

        <div className={styles.header}>

          <div className={styles.text}>

            {action === 'Login'
              ? 'Central Supply Login'
              : 'Create Account'}

          </div>

          <div className={styles.underline}></div>

        </div>

        <div className={styles.inputs}>

          <div className={styles.input}>

            <img
              src={userIcon.src}
              alt='user'
            />

            <input
              type='text'
              placeholder='Username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

          </div>

          <div className={styles.input}>

            <img
              src={passwordIcon.src}
              alt='password'
            />

            <input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

          </div>

          {action === 'Sign Up' && (

            <div className={styles.input}>

              <img
                src={passwordIcon.src}
                alt='confirm-password'
              />

              <input
                type='password'
                placeholder='Confirm Password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

            </div>

          )}

        </div>

        <button
          className={styles.loginButton}
          onClick={handleSubmit}
        >
          {action === 'Login'
            ? 'Login'
            : 'Create Account'}
        </button>

        <div className={styles.authSwitch}>

          {action === 'Login' ? (

            <p>

              Don&apos;t have an account?

              <span onClick={() => setAction('Sign Up')}>
                Sign Up
              </span>

            </p>

          ) : (

            <p>

              Already have an account?

              <span onClick={() => setAction('Login')}>
                Login
              </span>

            </p>

          )}

        </div>

      </div>

    </div>

  )
}