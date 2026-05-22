'use client'

import Link from 'next/link'
import type { SoulEntity } from '@/types'
import { SOUL_CATEGORIES } from '@/lib/constants'
import { BRAGA_EXPLORER } from '@/lib/constants'

function truncateAddr(addr: string) {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function truncateKey(key: string) {
  if (!key || key.length < 12) return key
  return `${key.slice(0, 10)}…`
}

export function SoulCard({ soul }: { soul: SoulEntity }) {
  const category = SOUL_CATEGORIES.find((c) => c.id === soul.category)

  return (
    <Link
      href={`/soul/${encodeURIComponent(soul.key)}`}
      className="block group"
    >
      <div className="bg-soul-card border border-soul-border rounded-xl p-5 hover:border-soul-purple/50 transition-all duration-200 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm truncate group-hover:text-soul-purple transition-colors">
              {soul.name}
            </h3>
            <p className="text-soul-muted text-xs mt-0.5">
              {category?.label ?? soul.category}
            </p>
          </div>
          {soul.forkedFrom && (
            <span
              title={`Forked from ${soul.forkedFrom}`}
              className="shrink-0 text-[10px] text-soul-cyan bg-soul-cyan/10 border border-soul-cyan/20 px-2 py-0.5 rounded-full"
            >
              fork
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-soul-muted text-xs leading-relaxed line-clamp-2 mb-4">
          {soul.description || 'No description provided.'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-soul-muted">
            by{' '}
            <a
              href={`${BRAGA_EXPLORER}/address/${soul.creator}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-soul-purple/80 hover:text-soul-purple"
            >
              {truncateAddr(soul.creator)}
            </a>
          </div>
          <div className="text-xs font-mono text-soul-muted">
            {truncateKey(soul.key)}
          </div>
        </div>
      </div>
    </Link>
  )
}
