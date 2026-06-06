import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
  title: 'MedSupply - Medical Inventory Management',
  description: 'Hospital medical supply inventory management system',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/golden-logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/golden-logo-dark.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/golden-logo.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/golden-logo.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        {children}

        {/* ✅ Toast system (GLOBAL) */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#fff',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#0f172a',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#0f172a',
              },
            },
          }}
        />

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}