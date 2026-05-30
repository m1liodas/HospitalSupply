'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import styles from './loginstyle.module.css'

import passwordIcon from '../../components/assets/padlock.png'
import userIcon from '../../components/assets/user.png'

export default function LoginSignup() {

  const router = useRouter()
  const [role, setRole] = useState('')
  const [action, setAction] = useState('Login')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')

  const handleSubmit = async () => {

    setError('')

    if (action === 'Sign Up') {

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

    }

    const apiAction = action === 'Sign Up' ? 'signup' : 'login'

    const response = await fetch('/api/auth', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        action: apiAction,
        username,
        password,
        role
      }),

    })

    const data = await response.json()

    if (!data.success) {
      setError(data.message)
      return
    }

    setError('')
    setShowSuccess(true)

    if (action === 'Login') {

      setTimeout(() => {

        localStorage.setItem('loggedIn', 'true')
        localStorage.setItem('userRole', data.user?.role || 'admin')

        if (data.user?.role === 'admin') {
          router.push('/dashboard')
        } else {

          const stationSlug = String(data.user.role)
            .toLowerCase()
            .replace(/\s+/g, '-')

          router.push(`/stations/${encodeURIComponent(stationSlug)}`)
        }

      }, 1800)

    }

    if (action === 'Sign Up') {
      
      setRole('')

      setTimeout(() => {

        setAction('Login')
        setUsername('')
        setPassword('')
        setConfirmPassword('')
        setShowSuccess(false)

      }, 1800)

    }

  }

  return (

    <div className={styles.loginPage}>
      <div className={styles.floatingBoxes}>
        <span>📦</span>
        <span>📦</span>
        <span>📦</span>
        <span>📦</span>
        <span>📦</span>
        <span>📦</span>
      </div>
      {showSuccess && (
        <div className={styles.successToast}>
          <div className={styles.successIcon}>📦</div>
          <div>
            <strong>Success</strong>
            <p>
              {action === 'Login'
                ? 'Login successful'
                : 'Account created successfully'}
            </p>
          </div>
        </div>
      )}

      {showAdminModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.adminModal}>

            <h3>Administrator Access</h3>

            <p>Enter administrator password</p>

            <input
              type="password"
              value={adminPassword}
              onChange={(e) =>
                setAdminPassword(e.target.value)
              }
              placeholder="Password"
            />

            <div className={styles.modalButtons}>

              <button
                onClick={() => {
                  setShowAdminModal(false)
                  setAdminPassword('')
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => {

                  if (adminPassword === 'CentralSupply') {

                    setError('')

                    setUsername('')
                    setPassword('')
                    setConfirmPassword('')

                    setShowAdminModal(false)
                    setAdminPassword('')

                    setAction('Sign Up')

                  } else {

                    setError('Invalid administrator password')

                  }

                }}
              >
                Continue
              </button>

            </div>

          </div>
        </div>
      )}

      <div className={styles.container}>

        <div className={styles.header}>

          <div className={styles.text}>

            {action === 'Login'
              ? 'Central Supply Login'
              : 'Create Account'}

          </div>

          <div className={styles.underline}></div>

        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
        >

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
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError('')
                }}
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
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
              />

            </div>

            {action === 'Sign Up' && (

              <>
                <div className={styles.input}>

                  <img
                    src={passwordIcon.src}
                    alt='confirm-password'
                  />

                  <input
                    type='password'
                    placeholder='Confirm Password'
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError('')
                    }}
                  />

                </div>

                <div className={styles.input}>

                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={styles.roleSelect}
                  >
                    <option value="" disabled>
                      Select Role
                    </option>

                    <option value="ER">ER</option>
                    <option value="OB-GYNE">OB-GYNE</option>
                    <option value="OR">OR</option>
                    <option value="DR">DR</option>
                    <option value="PEDIA">PEDIA</option>
                    <option value="MEDICINE">MEDICINE</option>
                    <option value="SURGICAL">SURGICAL</option>
                    <option value="NICU">NICU</option>
                    <option value="OPD">OPD</option>

                  </select>

                </div>
              </>

            )}

          </div>

          <button
            type="submit"
            className={styles.loginButton}
          >
            {action === 'Login'
              ? 'Login'
              : 'Create Account'}
          </button>
        </form>

        <div className={styles.authSwitch}>

          {action === 'Login' ? (

            <p>

              Don&apos;t have an account?

              <span onClick={() => {
                console.log('clicked')
                setShowAdminModal(true)
              }}>
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