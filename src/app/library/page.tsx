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

  useEffect(() => {
    load()
  }, [load])

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto px-6 py-24">
        <p className="text-2xs uppercase tracking-label text-lo mb-5">Library</p>
        <p className="text-hi text-lg font-light mb-2">Connect your wallet</p>
        <p className="text-mid text-sm mb-8 leading-relaxed">
          Your licenses are stored on-chain. No account needed — just your wallet.
        </p>
        <ConnectButton />
      </div>
    )
  }

  const active = licenses.filter(isLicenseActive)
  const expired = licenses.filter((l) => !isLicenseActive(l))

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-2xs uppercase tracking-label text-lo mb-5">Library</p>
        <h1 className="text-2xl font-light text-hi mb-2">My Licenses</h1>
        <p className="text-mid text-sm leading-relaxed">
          Licenses stored permanently on Arkiv. No platform can revoke them.
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface [border-width:0.5px] border-white/[0.05]" />
          ))}
        </div>
      ) : error ? (
        <div className="py-20">
          <p className="text-mid text-sm mb-3">{error}</p>
          <button
            onClick={load}
            className="text-xs text-lo hover:text-mid underline underline-offset-2 transition-colors"
          >
            Try again
          </button>
        </div>
      ) : licenses.length === 0 ? (
        <div className="py-20">
          <p className="text-mid text-sm mb-2">No licenses yet.</p>
          <Link
            href="/"
            className="text-xs text-lo hover:text-mid underline underline-offset-2 transition-colors"
          >
            Browse the marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section>
              <p className="text-2xs uppercase tracking-label text-lo mb-4">
                Active · {active.length}
              </p>
              <div className="space-y-2">
                {active.map((lic) => (
                  <LicenseRow key={lic.key} license={lic} active />
                ))}
              </div>
            </section>
          )}

          {expired.length > 0 && (
            <section>
              <p className="text-2xs uppercase tracking-label text-lo mb-4">
                Expired · {expired.length}
              </p>
              <div className="space-y-2 opacity-40">
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
    <div className="[border-width:0.5px] border-white/[0.07] p-4 flex items-center justify-between gap-4 hover:border-white/[0.14] transition-colors duration-150">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
          <Link
            href={`/soul/${encodeURIComponent(license.soulKey)}`}
            className="text-hi text-sm hover:underline underline-offset-2 truncate"
          >
            {license.soulName || 'Unnamed Soul'}
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`w-1 h-1 ${active ? 'bg-hi' : 'bg-lo'}`} />
            <span className="text-2xs text-lo capitalize">{license.tier}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-2xs font-mono ${active ? 'text-mid' : 'text-lo'}`}>
            {formatExpiry(license)}
          </span>
          <a
            href={`${BRAGA_EXPLORER}/entity/${license.key}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xs font-mono text-lo hover:text-mid transition-colors"
          >
            {license.key.slice(0, 12)}…
          </a>
        </div>
      </div>

      {active && (
        <Link
          href={`/soul/${encodeURIComponent(license.soulKey)}`}
          className="shrink-0 px-3 py-1.5 [border-width:0.5px] border-white/[0.14] text-mid text-xs hover:text-hi hover:border-white/[0.25] transition-colors duration-150"
        >
          Open
        </Link>
      )}
    </div>
  )
}
