'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function NavBar() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Marketplace' },
    { href: '/create', label: 'Create Soul' },
    { href: '/library', label: 'My Library' },
  ]

  return (
    <nav className="border-b border-soul-border bg-soul-bg/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-soul-purple to-soul-cyan flex items-center justify-center text-sm font-bold text-white">
              ψ
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">
              Soul Marketplace
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  pathname === href
                    ? 'text-white bg-white/10'
                    : 'text-soul-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <ConnectButton
          chainStatus="icon"
          showBalance={false}
          accountStatus="address"
        />
      </div>
    </nav>
  )
}
