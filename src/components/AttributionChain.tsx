'use client'

import Link from 'next/link'
import type { SoulEntity } from '@/types'

function truncateAddr(addr: string) {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function truncateKey(key: string) {
  if (!key) return ''
  return `${key.slice(0, 12)}…`
}

export function AttributionChain({ chain }: { chain: SoulEntity[] }) {
  if (!chain || chain.length <= 1) return null

  return (
    <div className="mt-6">
      <h3 className="text-xs text-soul-muted uppercase tracking-wider mb-3 font-medium">
        Attribution Chain
      </h3>
      <div className="space-y-0">
        {chain.map((soul, i) => (
          <div key={soul.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full border-2 mt-1 ${
                  i === 0
                    ? 'border-soul-purple bg-soul-purple'
                    : 'border-soul-muted bg-transparent'
                }`}
              />
              {i < chain.length - 1 && (
                <div className="w-px h-8 bg-soul-border mt-0.5" />
              )}
            </div>
            <div className="pb-2">
              <div className="flex items-center gap-2">
                <Link
                  href={`/soul/${encodeURIComponent(soul.key)}`}
                  className={`text-sm font-medium hover:underline ${
                    i === 0 ? 'text-white' : 'text-soul-muted'
                  }`}
                >
                  {soul.name}
                </Link>
                {i === 0 && (
                  <span className="text-[10px] text-soul-purple bg-soul-purple/10 border border-soul-purple/20 px-1.5 py-0.5 rounded">
                    current
                  </span>
                )}
              </div>
              <div className="text-xs text-soul-muted mt-0.5">
                <span className="font-mono">{truncateKey(soul.key)}</span>
                {soul.creator && (
                  <span className="ml-2">by {truncateAddr(soul.creator)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
