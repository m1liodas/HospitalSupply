import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
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
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
