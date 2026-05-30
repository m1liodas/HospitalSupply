'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, Building2 } from 'lucide-react'

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
      const res = await fetch('/api/stations')
      const data = await res.json()
      setStations(data)
    } catch (error) {
      console.error('Failed to fetch stations:', error)
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station) => {
            const route = STATION_ROUTES[station.name] || '#'
            return (
              <Link key={station.id} href={route}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{station.name}</CardTitle>
                          <CardDescription>{station.location}</CardDescription>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/70">
                      Click to manage and track daily supply usage for this station
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <Card className="mt-8 bg-accent/10 border-accent/30">
          <CardHeader>
            <CardTitle className="text-base">Currently Only ER Station Implemented</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground/70">
            The ER station page is fully functional with daily usage tracking. Other stations can use the same template structure. Click on ER to see the complete implementation.
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
