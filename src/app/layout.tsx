import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import { NavBar } from '@/components/NavBar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Soul Marketplace — AI Prompts You Actually Own',
  description:
    'Buy, sell, and fork AI system prompts as on-chain entities. Immutable attribution. Time-limited licenses. Zero platform lock-in.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-screen bg-soul-bg">
            <NavBar />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
