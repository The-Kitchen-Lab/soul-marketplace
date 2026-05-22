'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useArkivWallet } from '@/hooks/useArkivWallet'
import { createSoul } from '@/lib/souls'
import { SOUL_CATEGORIES } from '@/lib/constants'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function CreateSoulPage() {
  return (
    <Suspense fallback={null}>
      <CreateSoulForm />
    </Suspense>
  )
}

function CreateSoulForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { arkivWallet, isConnected } = useArkivWallet()

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'coding',
    price: '0',
    prompt: '',
    forkedFrom: '',
  })

  useEffect(() => {
    const forkedFrom = searchParams.get('forkedFrom')
    if (forkedFrom) update('forkedFrom', forkedFrom)
  }, [searchParams])

  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [txHash, setTxHash] = useState('')
  const [entityKey, setEntityKey] = useState('')
  const [error, setError] = useState('')

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!arkivWallet) return
    if (!form.name.trim() || !form.prompt.trim()) {
      setError('Name and system prompt are required.')
      return
    }

    setStatus('pending')
    setError('')

    try {
      const result = await createSoul(arkivWallet, {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        price: form.price,
        prompt: form.prompt.trim(),
        forkedFrom: form.forkedFrom.trim() || undefined,
      })
      setTxHash(result.txHash)
      setEntityKey(result.entityKey)
      setStatus('success')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
      setStatus('error')
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto px-6 py-24">
        <p className="text-2xs uppercase tracking-label text-lo mb-5">Connect Wallet</p>
        <p className="text-hi text-lg font-light mb-2">Connect your wallet</p>
        <p className="text-mid text-sm mb-8 leading-relaxed">
          You need a wallet connected to the Arkiv Braga testnet to create a Soul.
        </p>
        <ConnectButton />
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto px-6 py-24">
        <p className="text-2xs uppercase tracking-label text-lo mb-5">Soul Created</p>
        <h2 className="text-hi text-2xl font-light mb-2">On-chain.</h2>
        <p className="text-mid text-sm mb-8 leading-relaxed">
          Your system prompt is a permanent entity. Attribution is immutable.
        </p>

        <div className="[border-width:0.5px] border-white/[0.07] mb-8">
          <div className="p-4 [border-bottom-width:0.5px] border-white/[0.07]">
            <p className="text-2xs uppercase tracking-label text-lo mb-2">Entity Key</p>
            <p className="text-xs font-mono text-mid break-all">{entityKey}</p>
          </div>
          <div className="p-4">
            <p className="text-2xs uppercase tracking-label text-lo mb-2">Tx Hash</p>
            <p className="text-xs font-mono text-mid break-all">{txHash}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/soul/${encodeURIComponent(entityKey)}`)}
            className="px-5 py-2.5 bg-hi text-canvas text-xs font-medium hover:bg-mid transition-colors duration-150"
          >
            View Soul
          </button>
          <button
            onClick={() => {
              setStatus('idle')
              setForm({ name: '', description: '', category: 'coding', price: '0', prompt: '', forkedFrom: '' })
            }}
            className="px-5 py-2.5 [border-width:0.5px] border-white/[0.14] text-mid text-xs hover:text-hi hover:border-white/[0.25] transition-colors duration-150"
          >
            Create Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-2xs uppercase tracking-label text-lo mb-5">New Soul</p>
        <h1 className="text-2xl font-light text-hi mb-2">Create a Soul</h1>
        <p className="text-mid text-sm leading-relaxed">
          Your system prompt becomes a permanent on-chain entity. You are{' '}
          <code className="text-hi font-mono text-xs">$creator</code> — immutably, forever.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Name */}
        <div>
          <label className="block text-2xs uppercase tracking-label text-lo mb-2.5">
            Name <span className="text-lo">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g. Senior Rust Engineer"
            className="w-full bg-surface [border-width:0.5px] border-white/[0.07] px-4 py-3 text-sm text-hi placeholder:text-lo focus:outline-none focus:border-white/[0.25] transition-colors duration-150"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-2xs uppercase tracking-label text-lo mb-2.5">
            Description
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="What does this agent specialize in?"
            className="w-full bg-surface [border-width:0.5px] border-white/[0.07] px-4 py-3 text-sm text-hi placeholder:text-lo focus:outline-none focus:border-white/[0.25] transition-colors duration-150"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-2xs uppercase tracking-label text-lo mb-3">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SOUL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => update('category', cat.id)}
                className={`px-3 py-2.5 text-xs text-left transition-colors duration-150 [border-width:0.5px] ${
                  form.category === cat.id
                    ? 'border-white/[0.28] text-hi bg-white/[0.04]'
                    : 'border-white/[0.07] text-lo hover:text-mid hover:border-white/[0.14]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-2xs uppercase tracking-label text-lo mb-2.5">
            System Prompt <span className="text-lo">*</span>
          </label>
          <textarea
            value={form.prompt}
            onChange={(e) => update('prompt', e.target.value)}
            placeholder="You are a senior Rust engineer with 10 years of experience..."
            rows={10}
            className="w-full bg-surface [border-width:0.5px] border-white/[0.07] px-4 py-3 text-sm text-hi placeholder:text-lo focus:outline-none focus:border-white/[0.25] transition-colors duration-150 font-mono resize-none"
          />
          <p className="text-2xs text-lo mt-2">
            Stored on-chain. Visible to licensed users only.
          </p>
        </div>

        {/* Fork from */}
        <div>
          <label className="block text-2xs uppercase tracking-label text-lo mb-2.5">
            Fork From{' '}
            <span className="text-lo font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.forkedFrom}
            onChange={(e) => update('forkedFrom', e.target.value)}
            placeholder="Entity key of the original soul"
            className="w-full bg-surface [border-width:0.5px] border-white/[0.07] px-4 py-3 text-sm text-hi placeholder:text-lo focus:outline-none focus:border-white/[0.25] transition-colors duration-150 font-mono"
          />
          <p className="text-2xs text-lo mt-2">
            Attribution chain preserved on-chain.
          </p>
        </div>

        {error && (
          <div className="text-mid text-xs [border-width:0.5px] border-white/[0.14] px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'pending'}
          className="w-full py-3 bg-hi text-canvas font-medium text-sm hover:bg-mid disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
        >
          {status === 'pending' ? 'Creating…' : 'Create Soul'}
        </button>
      </form>
    </div>
  )
}
