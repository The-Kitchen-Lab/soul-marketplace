'use client'

import { useState, useEffect, useCallback } from 'react'
import { SoulCard } from '@/components/SoulCard'
import { querySouls } from '@/lib/souls'
import { SOUL_CATEGORIES } from '@/lib/constants'
import type { SoulEntity } from '@/types'

export default function MarketplacePage() {
  const [souls, setSouls] = useState<SoulEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const results = await querySouls({
        category: selectedCategory || undefined,
        limit: 48,
      })
      setSouls(results)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load souls')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-soul-cyan bg-soul-cyan/10 border border-soul-cyan/20 px-3 py-1 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-soul-cyan animate-pulse" />
          Live on Arkiv Braga Testnet
        </div>
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
          AI Souls. Yours to Own.
        </h1>
        <p className="text-soul-muted text-lg max-w-xl mx-auto leading-relaxed">
          Every system prompt is an on-chain entity. The creator is immutable.
          Licenses expire. Forks trace back. No platform owns your agents.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap mb-8">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            selectedCategory === ''
              ? 'bg-soul-purple text-white'
              : 'text-soul-muted hover:text-white bg-soul-card border border-soul-border'
          }`}
        >
          All
        </button>
        {SOUL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)
            }
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedCategory === cat.id
                ? 'bg-soul-purple text-white'
                : 'text-soul-muted hover:text-white bg-soul-card border border-soul-border'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-soul-card border border-soul-border animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button
            onClick={load}
            className="text-sm text-soul-muted hover:text-white underline"
          >
            Try again
          </button>
        </div>
      ) : souls.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-soul-muted text-lg mb-2">No souls found.</p>
          <p className="text-soul-muted text-sm">
            Be the first to{' '}
            <a href="/create" className="text-soul-purple hover:underline">
              create one
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {souls.map((soul) => (
            <SoulCard key={soul.key} soul={soul} />
          ))}
        </div>
      )}
    </div>
  )
}
