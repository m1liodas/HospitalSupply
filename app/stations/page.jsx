'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import Link from 'next/link'
import { ArrowRight, Building2 } from 'lucide-react'
import { fetchJson } from '@/lib/fetcher'

const STATION_ROUTES = {
  'ER': '/stations/er',
  'OB-GYNE': '/stations/ob-gyne',
  'OR': '/stations/or',
  'DR': '/stations/dr',
  'PEDIA': '/stations/pedia',
  'MEDICINE': '/stations/medicine',
  'SURGICAL': '/stations/surgical',
  'OPD': '/stations/opd',
  'NICU': '/stations/nicu',
}

export default function StationsPage() {
  const router = useRouter()
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('loggedIn')
    const userRole = localStorage.getItem('userRole')

    if (!isLoggedIn) {
      router.push('/LoginSignup')
      return
    }

    if (userRole && userRole !== 'admin') {
      const stationSlug = String(userRole)
        .toLowerCase()
        .replace(/\s+/g, '-')
      router.push(`/stations/${encodeURIComponent(stationSlug)}`)
      return
    }

    fetchStations()
  }, [router])

  const fetchStations = async () => {
    try {
      setError('')
      const data = await fetchJson('/api/stations')
      setStations(data)
    } catch (error) {
      console.error('Failed to fetch stations:', error)
      setError('Unable to load station list. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-foreground/60">Loading stations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Hospital Stations</h1>
          <p className="text-foreground/60">Select a station to view and track daily supplies usage</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="space-y-3">
          {stations.map((station) => {
            const route = STATION_ROUTES[station.name] || '#'
            return (
              <Link key={station.id} href={route}>
                <div className="group flex items-center justify-between p-4 border border-border rounded-lg bg-background hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{station.name}</h3>
                      <p className="text-sm text-foreground/60">{station.location}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 p-6 bg-accent/10 border border-accent/30 rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">Managing Stations</h3>
          <p className="text-sm text-foreground/70">
            Select a station above to manage inventory, track daily supply usage, and view station-specific reports.
          </p>
        </div>
      </main>
    </div>
  )
}
