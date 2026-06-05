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
  History
} from 'lucide-react'

export function Navigation() {

  const pathname = usePathname()

  const router = useRouter()

  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    setUserRole(role || 'admin')
  }, [])

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

      <nav className="flex items-center h-16 px-6 gap-1">

        <div className="flex items-center gap-2 mr-8">

          <Image
            src="/golden-logo.png"
            alt="Central Supply Logo"
            width={45}
            height={45}
          />

          <span className="font-bold text-lg text-sidebar-foreground">
            Central Supply
          </span>

        </div>

        <div className="flex gap-1 flex-1">

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

                <Icon className="w-4 h-4" />

                {link.label}

              </Link>

            )

          })}

        </div>

        {/* LOGOUT BUTTON */}

        <button
          onClick={handleLogout}
          className="
            flex items-center gap-2
            px-4 py-2
            rounded-lg
            text-sidebar-foreground
            hover:bg-red-500/10
            hover:text-red-500
            transition-all duration-200
          "
        >

          <LogOut className="w-4 h-4" />

          <span className="text-sm font-medium">
            Logout
          </span>

        </button>

      </nav>

    </div>

  )

}