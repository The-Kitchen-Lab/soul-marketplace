import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { NavBar } from '@/components/NavBar'
import { SmokeBackground } from '@/components/SmokeBackground'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SoulStore — AI Prompts You Actually Own',
  description:
    'Buy, sell, and fork AI system prompts as on-chain entities. Immutable attribution. Time-limited licenses. Zero platform lock-in.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <Providers>
          <div className="fixed inset-0 opacity-40 pointer-events-none">
            <SmokeBackground smokeColor="#6b21a8" />
          </div>
          <div className="relative z-10 flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
