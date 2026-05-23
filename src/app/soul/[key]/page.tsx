'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { getSoulWithPrompt, getAttributionChain, updateSoulPrompt } from '@/lib/souls'
import { createLicense, hasValidLicense, isLicenseActive, formatExpiry } from '@/lib/licenses'
import { useArkivWallet } from '@/hooks/useArkivWallet'
import { AttributionChain } from '@/components/AttributionChain'
import { SOUL_CATEGORIES, BRAGA_EXPLORER } from '@/lib/constants'
import { ArrowLeft, Lock, Copy, Check } from 'lucide-react'
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
  const [copied, setCopied] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'personal' | 'commercial'>('personal')
  const [selectedDuration, setSelectedDuration] = useState(30)
  const [isEditingPrompt, setIsEditingPrompt] = useState(false)
  const [editPromptText, setEditPromptText] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [saveError, setSaveError] = useState('')

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

  async function handleSavePrompt() {
    if (!arkivWallet || !soul) return
    setSaveStatus('pending')
    setSaveError('')
    try {
      await updateSoulPrompt(arkivWallet, soul, editPromptText)
      setSaveStatus('idle')
      setIsEditingPrompt(false)
      await load()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Update failed')
      setSaveStatus('error')
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(soul?.prompt ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const category = soul ? SOUL_CATEGORIES.find((c) => c.id === soul.category) : null
  const isOwner = soul && address && soul.creator.toLowerCase() === address.toLowerCase()

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-3">
        <div className="h-5 bg-surface [border-width:0.5px] border-white/[0.05] w-1/3" />
        <div className="h-4 bg-surface [border-width:0.5px] border-white/[0.05]" />
        <div className="h-4 bg-surface [border-width:0.5px] border-white/[0.05] w-3/4" />
      </div>
    )
  }

  if (!soul) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24">
        <p className="text-mid text-sm mb-3">Soul not found.</p>
        <button
          onClick={() => router.push('/')}
          className="text-xs text-lo hover:text-mid underline underline-offset-2 transition-colors"
        >
          Back to store
        </button>
      </div>
    )
  }

  const hasAccess = isOwner || (license && isLicenseActive(license))

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Back */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-1.5 text-xs text-lo hover:text-mid transition-colors duration-150 mb-10"
      >
        <ArrowLeft size={11} strokeWidth={1.5} />
        SoulStore
      </button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main */}
        <div className="md:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-2xs uppercase tracking-label text-lo">
                {category?.label ?? soul.category}
              </p>
              {soul.forkedFrom && (
                <span className="text-2xs text-lo [border-width:0.5px] border-white/[0.07] px-1.5 py-0.5">
                  fork
                </span>
              )}
            </div>
            <h1 className="text-2xl font-light text-hi tracking-tight">{soul.name}</h1>
          </div>

          {soul.description && (
            <p className="text-mid text-sm leading-relaxed mb-8">
              {soul.description}
            </p>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 mb-8">
            <div className="[border-width:0.5px] border-white/[0.07] p-3">
              <p className="text-2xs uppercase tracking-label text-lo mb-2">Creator</p>
              <a
                href={`${BRAGA_EXPLORER}/address/${soul.creator}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-mid hover:text-hi transition-colors underline-offset-2 hover:underline"
              >
                {truncateAddr(soul.creator)}
              </a>
              <p className="text-2xs text-lo mt-1 uppercase tracking-label">immutable</p>
            </div>
            <div className="[border-width:0.5px] border-white/[0.07] p-3">
              <p className="text-2xs uppercase tracking-label text-lo mb-2">Entity Key</p>
              <a
                href={`${BRAGA_EXPLORER}/entity/${key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-mid hover:text-hi transition-colors hover:underline underline-offset-2 break-all"
              >
                {key.slice(0, 16)}…
              </a>
            </div>
          </div>

          {/* Attribution chain */}
          <AttributionChain chain={chain} />

          {/* System Prompt */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-2xs uppercase tracking-label text-lo">System Prompt</p>
              <div className="flex items-center gap-3">
                {isOwner && !isEditingPrompt && (
                  <button
                    onClick={() => {
                      setEditPromptText(soul.prompt ?? '')
                      setIsEditingPrompt(true)
                    }}
                    className="text-xs text-lo hover:text-mid transition-colors underline underline-offset-2"
                  >
                    {soul.prompt ? 'Edit' : 'Set Prompt'}
                  </button>
                )}
                {hasAccess && !isEditingPrompt && (
                  <button
                    onClick={() => setShowPrompt(!showPrompt)}
                    className="text-xs text-lo hover:text-mid transition-colors underline underline-offset-2"
                  >
                    {showPrompt ? 'Hide' : 'Reveal'}
                  </button>
                )}
              </div>
            </div>

            {isOwner && isEditingPrompt ? (
              <div>
                <textarea
                  value={editPromptText}
                  onChange={(e) => setEditPromptText(e.target.value)}
                  rows={10}
                  className="w-full bg-surface [border-width:0.5px] border-white/[0.07] text-xs text-mid font-mono p-4 resize-none focus:outline-none focus:border-white/[0.2] leading-relaxed"
                  placeholder="Enter your system prompt here…"
                />
                {saveError && (
                  <p className="text-xs text-mid mt-2 leading-relaxed">{saveError}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSavePrompt}
                    disabled={saveStatus === 'pending' || !arkivWallet}
                    className="py-1.5 px-4 bg-hi text-canvas text-xs font-medium hover:bg-mid disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    {saveStatus === 'pending' ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingPrompt(false)
                      setSaveStatus('idle')
                      setSaveError('')
                    }}
                    className="py-1.5 px-4 [border-width:0.5px] border-white/[0.14] text-lo text-xs hover:text-mid transition-colors duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : hasAccess && showPrompt ? (
              <div className="[border-width:0.5px] border-white/[0.07] relative">
                <pre className="text-xs text-mid font-mono whitespace-pre-wrap break-words leading-relaxed p-5">
                  {soul.prompt ?? 'No prompt content found.'}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 flex items-center gap-1.5 text-2xs text-lo hover:text-mid bg-canvas [border-width:0.5px] border-white/[0.07] px-2 py-1 transition-colors duration-150"
                >
                  {copied ? <Check size={9} strokeWidth={1.5} /> : <Copy size={9} strokeWidth={1.5} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            ) : (
              <div className="[border-width:0.5px] border-white/[0.07] p-10 flex flex-col items-center gap-3">
                <Lock size={14} strokeWidth={1} className="text-lo" />
                <p className="text-xs text-lo text-center">
                  {isOwner
                    ? 'Click "Set Prompt" above to add a system prompt.'
                    : 'Acquire a license to access the system prompt.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Status indicators */}
          {license && isLicenseActive(license) && (
            <div className="[border-width:0.5px] border-white/[0.07] p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-1 h-1 bg-hi" />
                <p className="text-xs text-hi">Licensed</p>
              </div>
              <p className="text-2xs text-lo capitalize">
                {license.tier} · {formatExpiry(license)}
              </p>
            </div>
          )}

          {isOwner && (
            <div className="[border-width:0.5px] border-white/[0.07] p-4">
              <p className="text-xs text-hi mb-1">Your Soul</p>
              <p className="text-2xs text-lo leading-relaxed">
                You are the immutable <code className="font-mono text-mid">$creator</code>.
              </p>
            </div>
          )}

          {/* Acquire License */}
          {!isOwner && (
            <div className="[border-width:0.5px] border-white/[0.07] p-4">
              <p className="text-2xs uppercase tracking-label text-lo mb-4">Get License</p>

              {!isConnected ? (
                <ConnectButton />
              ) : (
                <>
                  {/* Tier */}
                  <div className="mb-4">
                    <p className="text-2xs text-lo mb-2">Type</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['personal', 'commercial'] as const).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setSelectedTier(tier)}
                          className={`py-2 text-xs capitalize transition-colors duration-150 [border-width:0.5px] ${
                            selectedTier === tier
                              ? 'border-white/[0.28] text-hi bg-white/[0.04]'
                              : 'border-white/[0.07] text-lo hover:text-mid hover:border-white/[0.14]'
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mb-5">
                    <p className="text-2xs text-lo mb-2">Duration</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[30, 90, 365].map((days) => (
                        <button
                          key={days}
                          onClick={() => setSelectedDuration(days)}
                          className={`py-2 text-xs transition-colors duration-150 [border-width:0.5px] ${
                            selectedDuration === days
                              ? 'border-white/[0.28] text-hi bg-white/[0.04]'
                              : 'border-white/[0.07] text-lo hover:text-mid hover:border-white/[0.14]'
                          }`}
                        >
                          {days === 365 ? '1yr' : `${days}d`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {licenseError && (
                    <p className="text-xs text-mid mb-3 leading-relaxed">{licenseError}</p>
                  )}

                  {licenseStatus === 'success' ? (
                    <div className="flex items-center gap-1.5 py-2">
                      <div className="w-1 h-1 bg-hi" />
                      <p className="text-xs text-hi">License created</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleLicense}
                      disabled={licenseStatus === 'pending' || !arkivWallet}
                      className="w-full py-2.5 bg-hi text-canvas text-xs font-medium hover:bg-mid disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      {licenseStatus === 'pending' ? 'Creating…' : !arkivWallet ? 'Wallet loading…' : 'Acquire License'}
                    </button>
                  )}

                  <p className="text-2xs text-lo text-center mt-3">
                    License stored on-chain. Ownership is yours.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Fork */}
          <div className="[border-width:0.5px] border-white/[0.07] p-4">
            <p className="text-2xs uppercase tracking-label text-lo mb-1.5">Fork</p>
            <p className="text-2xs text-lo leading-relaxed mb-4">
              Attribution chain preserved. Original creator always visible.
            </p>
            <button
              onClick={() =>
                router.push(`/create?forkedFrom=${encodeURIComponent(key)}`)
              }
              className="w-full py-2 [border-width:0.5px] border-white/[0.14] text-mid text-xs hover:text-hi hover:border-white/[0.25] transition-colors duration-150"
            >
              Fork this Soul
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
