'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const NAV_LINKS = [
  { href: '/', label: 'Store' },
  { href: '/create', label: 'Create' },
  { href: '/library', label: 'Library' },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 [border-bottom-width:0.5px] border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">

        {/* Left: logotype + nav */}
        <div className="flex items-center gap-10">
          <Link href="/" className="text-hi font-medium text-sm tracking-tight">
            SoulStore
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-xs tracking-wide transition-colors duration-150 ${
                  pathname === href ? 'text-hi' : 'text-mid hover:text-hi'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: wallet */}
        <ConnectButton.Custom>
          {({ account, openAccountModal, openConnectModal, mounted }) => {
            if (!mounted) {
              return <div className="h-7 w-16" aria-hidden="true" />
            }

            if (!account) {
              return (
                <button
                  type="button"
                  onClick={openConnectModal}
                  className="[border-width:0.5px] border-white/20 hover:border-white/40 px-3 h-7 text-2xs tracking-label uppercase text-mid hover:text-hi transition-colors duration-150"
                >
                  Connect
                </button>
              )
            }

            return (
              <button
                type="button"
                onClick={openAccountModal}
                className="font-mono text-xs text-mid hover:text-hi transition-colors duration-150"
              >
                {account.displayName}
              </button>
            )
          }}
        </ConnectButton.Custom>

      </div>
    </nav>
  )
}
