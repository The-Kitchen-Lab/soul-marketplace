'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { queryLicensesByHolder, isLicenseActive, formatExpiry } from '@/lib/licenses'
import { BRAGA_EXPLORER } from '@/lib/constants'
import type { LicenseEntity } from '@/types'

export default function LibraryPage() {
  const { address, isConnected } = useAccount()
  const [licenses, setLicenses] = useState<LicenseEntity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!address) return
    setLoading(true)
    setError('')
    try {
      const data = await queryLicensesByHolder(address)
      setLicenses(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load licenses')
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => { load() }, [load])

  if (!isConnected) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-white text-xl font-semibold mb-2">Connect to view your library</p>
        <p className="text-soul-muted text-sm mb-6">
          Your licenses are stored on-chain. No account needed — just your wallet.
        </p>
        <ConnectButton />
      </div>
    )
  }

  const active = licenses.filter(isLicenseActive)
  const expired = licenses.filter((l) => !isLicenseActive(l))

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">My Library</h1>
        <p className="text-soul-muted text-sm">
          Licenses you own, stored permanently on Arkiv. No platform can revoke them.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-soul-card border border-soul-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm">{error}</div>
      ) : licenses.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-soul-muted text-lg mb-2">No licenses yet.</p>
          <Link href="/" className="text-soul-purple text-sm hover:underline">
            Browse the marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <section>
              <h2 className="text-xs text-soul-muted uppercase tracking-wider mb-3 font-medium">
                Active ({active.length})
              </h2>
              <div className="space-y-3">
                {active.map((lic) => (
                  <LicenseRow key={lic.key} license={lic} active />
                ))}
              </div>
            </section>
          )}

          {expired.length > 0 && (
            <section>
              <h2 className="text-xs text-soul-muted uppercase tracking-wider mb-3 font-medium">
                Expired ({expired.length})
              </h2>
              <div className="space-y-3 opacity-50">
                {expired.map((lic) => (
                  <LicenseRow key={lic.key} license={lic} active={false} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function LicenseRow({ license, active }: { license: LicenseEntity; active: boolean }) {
  return (
    <div className="bg-soul-card border border-soul-border rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/soul/${encodeURIComponent(license.soulKey)}`}
            className="text-white text-sm font-medium hover:text-soul-purple transition-colors truncate"
          >
            {license.soulName || 'Unnamed Soul'}
          </Link>
          <span
            className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border capitalize ${
              active
                ? 'text-green-400 bg-green-400/10 border-green-400/20'
                : 'text-soul-muted bg-soul-card border-soul-border'
            }`}
          >
            {license.tier}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-soul-muted">
          <span className={active ? 'text-green-400' : 'text-red-400'}>
            {formatExpiry(license)}
          </span>
          <a
            href={`${BRAGA_EXPLORER}/entity/${license.key}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:text-white"
          >
            {license.key.slice(0, 12)}…
          </a>
        </div>
      </div>

      {active && (
        <Link
          href={`/soul/${encodeURIComponent(license.soulKey)}`}
          className="shrink-0 px-3 py-1.5 bg-soul-purple/20 border border-soul-purple/30 text-soul-purple rounded-lg text-xs hover:bg-soul-purple/30 transition-colors"
        >
          Open
        </Link>
      )}
    </div>
  )
}
