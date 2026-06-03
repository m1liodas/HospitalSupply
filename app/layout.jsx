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
        url: '/icon-dark-32x32ODH.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-light-32x32ODH.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon-ODH.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/dimension-180x180.png',
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
