'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { getSoulWithPrompt, getAttributionChain } from '@/lib/souls'
import { createLicense, hasValidLicense, isLicenseActive, formatExpiry } from '@/lib/licenses'
import { useArkivWallet } from '@/hooks/useArkivWallet'
import { AttributionChain } from '@/components/AttributionChain'
import { SOUL_CATEGORIES, BRAGA_EXPLORER } from '@/lib/constants'
import type { SoulEntity, LicenseEntity } from '@/types'

function truncateAddr(addr: string) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default function SoulDetailPage() {
  const params = useParams()
  const router = useRouter()
  const key = decodeURIComponent(params.key as string)
  const { address, isConnected } = useAccount()
  const { arkivWallet } = useArkivWallet()

  const [soul, setSoul] = useState<SoulEntity | null>(null)
  const [chain, setChain] = useState<SoulEntity[]>([])
  const [license, setLicense] = useState<LicenseEntity | null>(null)
  const [loading, setLoading] = useState(true)
  const [licenseStatus, setLicenseStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [licenseError, setLicenseError] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'personal' | 'commercial'>('personal')
  const [selectedDuration, setSelectedDuration] = useState(30)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [soulData, chainData] = await Promise.all([
        getSoulWithPrompt(key),
        getAttributionChain(key),
      ])
      setSoul(soulData)
      setChain(chainData)
    } finally {
      setLoading(false)
    }
  }, [key])

  const checkLicense = useCallback(async () => {
    if (!address || !key) return
    const lic = await hasValidLicense(address, key)
    setLicense(lic)
  }, [address, key])

  useEffect(() => { load() }, [load])
  useEffect(() => { checkLicense() }, [checkLicense])

  async function handleLicense() {
    if (!arkivWallet || !soul) return
    setLicenseStatus('pending')
    setLicenseError('')
    try {
      await createLicense(arkivWallet, {
        soulKey: key,
        soulName: soul.name,
        tier: selectedTier,
        durationDays: selectedDuration,
      })
      setLicenseStatus('success')
      await checkLicense()
    } catch (e) {
      setLicenseError(e instanceof Error ? e.message : 'Transaction failed')
      setLicenseStatus('error')
    }
  }

  const category = soul ? SOUL_CATEGORIES.find((c) => c.id === soul.category) : null
  const isOwner = soul && address && soul.creator.toLowerCase() === address.toLowerCase()

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-8 bg-soul-card rounded animate-pulse mb-4 w-1/2" />
        <div className="h-4 bg-soul-card rounded animate-pulse mb-2" />
        <div className="h-4 bg-soul-card rounded animate-pulse w-3/4" />
      </div>
    )
  }

  if (!soul) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-soul-muted">Soul not found.</p>
        <button onClick={() => router.push('/')} className="text-soul-purple text-sm mt-3 hover:underline">
          Back to marketplace
        </button>
      </div>
    )
  }

  const hasAccess = isOwner || (license && isLicenseActive(license))

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Back */}
      <button
        onClick={() => router.push('/')}
        className="text-soul-muted text-sm hover:text-white mb-6 flex items-center gap-1"
      >
        ← Marketplace
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main */}
        <div className="md:col-span-2">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">{soul.name}</h1>
                {soul.forkedFrom && (
                  <span className="text-xs text-soul-cyan bg-soul-cyan/10 border border-soul-cyan/20 px-2 py-0.5 rounded-full">
                    fork
                  </span>
                )}
              </div>
              <p className="text-soul-muted text-sm">{category?.label ?? soul.category}</p>
            </div>
          </div>

          {soul.description && (
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {soul.description}
            </p>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-soul-card border border-soul-border rounded-xl p-3">
              <p className="text-xs text-soul-muted mb-1">$creator</p>
              <a
                href={`${BRAGA_EXPLORER}/address/${soul.creator}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-soul-purple hover:underline"
              >
                {truncateAddr(soul.creator)}
              </a>
              <p className="text-[10px] text-soul-muted mt-0.5">immutable</p>
            </div>
            <div className="bg-soul-card border border-soul-border rounded-xl p-3">
              <p className="text-xs text-soul-muted mb-1">Entity Key</p>
              <a
                href={`${BRAGA_EXPLORER}/entity/${key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-soul-cyan hover:underline break-all"
              >
                {key.slice(0, 16)}…
              </a>
            </div>
          </div>

          {/* Attribution chain */}
          <AttributionChain chain={chain} />

          {/* System Prompt */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">System Prompt</h3>
              {hasAccess ? (
                <button
                  onClick={() => setShowPrompt(!showPrompt)}
                  className="text-xs text-soul-purple hover:underline"
                >
                  {showPrompt ? 'Hide' : 'Reveal'}
                </button>
              ) : (
                <span className="text-xs text-soul-muted">🔒 License required</span>
              )}
            </div>
            {hasAccess && showPrompt ? (
              <div className="bg-soul-card border border-soul-border rounded-xl p-4 relative">
                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
                  {soul.prompt ?? 'No prompt content found.'}
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(soul.prompt ?? '')}
                  className="absolute top-3 right-3 text-xs text-soul-muted hover:text-white bg-soul-bg px-2 py-1 rounded border border-soul-border"
                >
                  Copy
                </button>
              </div>
            ) : (
              <div className="bg-soul-card border border-soul-border rounded-xl p-8 text-center">
                <div className="text-2xl mb-2">🔐</div>
                <p className="text-soul-muted text-sm">
                  {isOwner
                    ? 'You are the creator — connect above to reveal.'
                    : 'Acquire a license to access the system prompt.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* License status */}
          {license && isLicenseActive(license) && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <p className="text-green-400 text-sm font-medium">✓ Licensed</p>
              <p className="text-xs text-soul-muted mt-1 capitalize">
                {license.tier} · {formatExpiry(license)}
              </p>
            </div>
          )}

          {isOwner && (
            <div className="bg-soul-purple/10 border border-soul-purple/30 rounded-xl p-4">
              <p className="text-soul-purple text-sm font-medium">Your Soul</p>
              <p className="text-xs text-soul-muted mt-1">
                You are the immutable <code>$creator</code> of this entity.
              </p>
            </div>
          )}

          {/* Acquire License */}
          {!isOwner && (
            <div className="bg-soul-card border border-soul-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Get License</h3>

              {!isConnected ? (
                <ConnectButton />
              ) : (
                <>
                  {/* Tier */}
                  <div className="mb-3">
                    <p className="text-xs text-soul-muted mb-2">License type</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['personal', 'commercial'] as const).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setSelectedTier(tier)}
                          className={`py-1.5 rounded-lg text-xs capitalize transition-colors border ${
                            selectedTier === tier
                              ? 'border-soul-purple bg-soul-purple/10 text-white'
                              : 'border-soul-border text-soul-muted hover:text-white'
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mb-4">
                    <p className="text-xs text-soul-muted mb-2">Duration</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[30, 90, 365].map((days) => (
                        <button
                          key={days}
                          onClick={() => setSelectedDuration(days)}
                          className={`py-1.5 rounded-lg text-xs transition-colors border ${
                            selectedDuration === days
                              ? 'border-soul-purple bg-soul-purple/10 text-white'
                              : 'border-soul-border text-soul-muted hover:text-white'
                          }`}
                        >
                          {days === 365 ? '1yr' : `${days}d`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {licenseError && (
                    <p className="text-red-400 text-xs mb-3">{licenseError}</p>
                  )}

                  {licenseStatus === 'success' ? (
                    <p className="text-green-400 text-sm text-center py-2">
                      License created! ✓
                    </p>
                  ) : (
                    <button
                      onClick={handleLicense}
                      disabled={licenseStatus === 'pending'}
                      className="w-full py-2.5 bg-soul-purple text-white rounded-lg text-sm hover:bg-soul-purple/90 disabled:opacity-50 transition-colors"
                    >
                      {licenseStatus === 'pending' ? 'Creating…' : 'Acquire License'}
                    </button>
                  )}

                  <p className="text-[10px] text-soul-muted text-center mt-2">
                    License stored on-chain. Ownership is yours.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Fork */}
          <div className="bg-soul-card border border-soul-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-1">Fork this Soul</h3>
            <p className="text-xs text-soul-muted mb-3">
              Attribution chain preserved. The original creator is always visible.
            </p>
            <button
              onClick={() =>
                router.push(`/create?forkedFrom=${encodeURIComponent(key)}`)
              }
              className="w-full py-2 bg-soul-card border border-soul-border text-soul-muted rounded-lg text-sm hover:text-white hover:border-soul-cyan/50 transition-colors"
            >
              Fork → Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
