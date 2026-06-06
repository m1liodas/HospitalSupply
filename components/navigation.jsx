'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'

import {
  usePathname,
  useRouter
} from 'next/navigation'

import { cn } from '@/lib/utils'

import {
  Package,
  Pill,
  LogOut,
  BarChart3,
  Building2,
  History,
  Menu,
  X
} from 'lucide-react'

export function Navigation() {

  const pathname = usePathname()

  const router = useRouter()

  const [userRole, setUserRole] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    setUserRole(role || 'admin')
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {

    localStorage.removeItem('loggedIn')
    localStorage.removeItem('userRole')

    router.push('/LoginSignup')

  }

  const isStationUser = userRole && userRole !== 'admin'

  const links = isStationUser ? [] : [

    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
    },

    {
      href: '/central-supply',
      label: 'Central Supply',
      icon: Package,
    },

    {
      href: '/stations',
      label: 'Stations',
      icon: Building2,
    },

    {
      href: '/history',
      label: 'History & Audit',
      icon: History,
    },

  ]

  return (

    <div className="bg-sidebar border-b border-sidebar-border">

      <nav className="relative flex items-center h-16 px-4 sm:px-6 gap-1">

        <div className="flex items-center gap-2 mr-4">

          <Image
            src="/golden-logo.png"
            alt="Golden Logo"
            width={24}
            height={24}
            className="w-12 h-12"
          />

          <span className="font-bold text-lg text-sidebar-foreground">
            Central Supply
          </span>

        </div>

        <div className="hidden md:flex gap-1 flex-1">

          {links.map((link) => {

            const Icon = link.icon

            const isActive =
              pathname === link.href ||
              pathname.startsWith(link.href + '/')

            return (

              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
                )}
              >

                <Icon />

                {link.label}

              </Link>

            )

          })}

        </div>

        <div className="flex items-center gap-2 ml-auto md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/20 transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sidebar-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />

          <span className="text-sm font-medium">
            Logout
          </span>
        </button>

      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-sidebar-border bg-sidebar px-4 py-4">
          <div className="flex flex-col gap-2">
            {links.map((link) => {
              const Icon = link.icon
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + '/')

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
                  )}
                >
                  <Icon />
                  {link.label}
                </Link>
              )
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-sidebar-border px-4 py-3 text-sm font-medium text-sidebar-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}

    </div>

  )

}