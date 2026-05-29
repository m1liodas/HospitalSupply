'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block animate-pulse mb-4">
          <div className="w-12 h-12 bg-primary rounded-full"></div>
        </div>
        <p className="text-foreground/60">Loading Medical Supply Inventory System...</p>
      </div>
    </main>
  )
}
