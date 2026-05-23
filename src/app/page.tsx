'use client'

import { useState, useEffect, useCallback } from 'react'
import { SoulCard } from '@/components/SoulCard'
import { querySouls } from '@/lib/souls'
import { SOUL_CATEGORIES } from '@/lib/constants'
import { SAMPLE_SOULS } from '@/data/souls'
import type { SoulEntity } from '@/types'

export default function MarketplacePage() {
  const [souls, setSouls] = useState<SoulEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const results = await querySouls({
        category: selectedCategory || undefined,
        limit: 48,
      })
      if (results.length > 0) {
        setSouls(results)
      } else {
        const filtered = selectedCategory
          ? SAMPLE_SOULS.filter((s) => s.category === selectedCategory)
          : SAMPLE_SOULS
        setSouls(
          filtered.map((s) => ({
            key: s.id,
            name: s.name,
            description: s.description,
            category: s.category,
            price: s.price,
            creator: s.creator,
            owner: s.creator,
          }))
        )
      }
    } catch {
      const filtered = selectedCategory
        ? SAMPLE_SOULS.filter((s) => s.category === selectedCategory)
        : SAMPLE_SOULS
      setSouls(
        filtered.map((s) => ({
          key: s.id,
          name: s.name,
          description: s.description,
          category: s.category,
          price: s.price,
          creator: s.creator,
          owner: s.creator,
        }))
      )
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-2xs uppercase tracking-label text-lo mb-5">
          Live · Arkiv Braga Testnet
        </p>
        <h1 className="text-display font-light text-hi mb-4">
          AI Souls.<br />Yours to Own.
        </h1>
        <p className="text-mid text-sm max-w-sm leading-relaxed">
          Every system prompt is an on-chain entity. Creator is immutable.
          Licenses expire. Forks trace back.
        </p>
      </div>

      {/* Category filter — tab underline style */}
      <div className="flex items-end gap-7 [border-bottom-width:0.5px] border-white/[0.07] mb-10 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory('')}
          className={`shrink-0 pb-3 text-xs tracking-wide transition-colors duration-150 [border-bottom-width:0.5px] -mb-px ${
            selectedCategory === ''
              ? 'text-hi border-hi'
              : 'text-lo hover:text-mid border-transparent'
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
            className={`shrink-0 pb-3 text-xs tracking-wide transition-colors duration-150 [border-bottom-width:0.5px] -mb-px ${
              selectedCategory === cat.id
                ? 'text-hi border-hi'
                : 'text-lo hover:text-mid border-transparent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 bg-surface/40 backdrop-blur-md [border-width:0.5px] border-white/[0.05]"
            />
          ))}
        </div>
      ) : souls.length === 0 ? (
        <div className="py-20">
          <p className="text-mid text-sm mb-2">No souls found.</p>
          <a
            href="/create"
            className="text-xs text-lo hover:text-mid underline underline-offset-2 transition-colors"
          >
            Create the first one
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {souls.map((soul) => (
            <SoulCard key={soul.key} soul={soul} />
          ))}
        </div>
      )}
    </div>
  )
}
