import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'An Gi O Dau - Khám phá Hòa Lạc',
  description: 'Nền tảng khám phá và lập kế hoạch hành trình thông minh cho khu vực Hòa Lạc với AI',
  generator: 'Next.js',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}