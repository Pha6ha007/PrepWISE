import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import SupportWidget from '@/components/support/SupportWidget'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Prepwise — AI GMAT Tutor',
  description: 'AI voice tutor for GMAT preparation. Talk to Sam — your personal tutor who remembers your progress, adapts to your weak spots, and helps you score 700+.',
  manifest: '/manifest.json',
  themeColor: '#0A0F1E',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Prepwise',
  },
  icons: {
    apple: '/icons/icon-192x192.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Prepwise" />
      </head>
      <body className={`${inter.className} bg-[#0A0F1E]`}>
        {children}
        <SupportWidget />
        <Toaster />
      </body>
    </html>
  )
}
