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
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-white text-xl font-semibold mb-2">Connect your wallet</p>
        <p className="text-soul-muted text-sm mb-6">
          You need a wallet connected to the Arkiv Braga testnet to create a Soul.
        </p>
        <ConnectButton />
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-5 text-2xl">
          ✓
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">Soul Created</h2>
        <p className="text-soul-muted text-sm mb-6">
          Your system prompt is now a permanent on-chain entity. The attribution is immutable.
        </p>
        <div className="bg-soul-card border border-soul-border rounded-xl p-4 text-left mb-6 space-y-2">
          <div>
            <span className="text-xs text-soul-muted">Entity Key</span>
            <p className="text-xs font-mono text-soul-cyan break-all mt-0.5">
              {entityKey}
            </p>
          </div>
          <div>
            <span className="text-xs text-soul-muted">Tx Hash</span>
            <p className="text-xs font-mono text-soul-purple break-all mt-0.5">
              {txHash}
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push(`/soul/${encodeURIComponent(entityKey)}`)}
            className="px-4 py-2 bg-soul-purple text-white rounded-lg text-sm hover:bg-soul-purple/90"
          >
            View Soul
          </button>
          <button
            onClick={() => {
              setStatus('idle')
              setForm({ name: '', description: '', category: 'coding', price: '0', prompt: '', forkedFrom: '' })
            }}
            className="px-4 py-2 bg-soul-card border border-soul-border text-soul-muted rounded-lg text-sm hover:text-white"
          >
            Create Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Create a Soul</h1>
        <p className="text-soul-muted text-sm">
          Your system prompt becomes a permanent on-chain entity. You are{' '}
          <code className="text-soul-cyan">$creator</code> — immutably, forever.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm text-white mb-1.5 font-medium">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g. Senior Rust Engineer"
            className="w-full bg-soul-card border border-soul-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-soul-muted focus:outline-none focus:border-soul-purple transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-white mb-1.5 font-medium">
            Description
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="What does this agent specialize in?"
            className="w-full bg-soul-card border border-soul-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-soul-muted focus:outline-none focus:border-soul-purple transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm text-white mb-1.5 font-medium">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SOUL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => update('category', cat.id)}
                className={`px-3 py-2 rounded-lg text-sm text-left transition-colors border ${
                  form.category === cat.id
                    ? 'border-soul-purple bg-soul-purple/10 text-white'
                    : 'border-soul-border bg-soul-card text-soul-muted hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-sm text-white mb-1.5 font-medium">
            System Prompt <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.prompt}
            onChange={(e) => update('prompt', e.target.value)}
            placeholder="You are a senior Rust engineer with 10 years of experience..."
            rows={10}
            className="w-full bg-soul-card border border-soul-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-soul-muted focus:outline-none focus:border-soul-purple transition-colors font-mono resize-none"
          />
          <p className="text-xs text-soul-muted mt-1.5">
            Stored on-chain. Visible to licensed users only after acquiring a license.
          </p>
        </div>

        {/* Fork from */}
        <div>
          <label className="block text-sm text-white mb-1.5 font-medium">
            Fork from{' '}
            <span className="text-soul-muted font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.forkedFrom}
            onChange={(e) => update('forkedFrom', e.target.value)}
            placeholder="Entity key of the original soul"
            className="w-full bg-soul-card border border-soul-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-soul-muted focus:outline-none focus:border-soul-purple transition-colors font-mono"
          />
          <p className="text-xs text-soul-muted mt-1.5">
            Attribution chain is preserved on-chain. The original creator's{' '}
            <code>$creator</code> remains immutable.
          </p>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'pending'}
          className="w-full py-3 bg-soul-purple text-white rounded-lg font-medium text-sm hover:bg-soul-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'pending' ? 'Creating Soul…' : 'Create Soul on Arkiv'}
        </button>
      </form>
    </div>
  )
}
