'use client'

import Link from 'next/link'
import type { SoulEntity } from '@/types'

function truncateKey(key: string) {
  if (!key) return ''
  return `${key.slice(0, 12)}…`
}

export function AttributionChain({ chain }: { chain: SoulEntity[] }) {
  if (!chain || chain.length <= 1) return null

  return (
    <div className="mt-8">
      <p className="text-2xs uppercase tracking-label text-lo mb-5">
        Attribution Chain
      </p>
      <div className="space-y-0">
        {chain.map((soul, i) => (
          <div key={soul.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1.5">
              <div
                className={`w-1.5 h-1.5 [border-width:0.5px] ${
                  i === 0
                    ? 'border-hi bg-hi'
                    : 'border-lo bg-transparent'
                }`}
              />
              {i < chain.length - 1 && (
                <div className="w-px h-7 bg-white/[0.07] mt-0.5" />
              )}
            </div>
            <div className="pb-2">
              <div className="flex items-center gap-2.5">
                <Link
                  href={`/soul/${encodeURIComponent(soul.key)}`}
                  className={`text-xs hover:underline underline-offset-2 ${
                    i === 0 ? 'text-hi' : 'text-mid'
                  }`}
                >
                  {soul.name}
                </Link>
                {i === 0 && (
                  <span className="text-2xs uppercase tracking-label text-lo [border-width:0.5px] border-white/[0.07] px-1.5 py-0.5">
                    current
                  </span>
                )}
              </div>
              <p className="text-2xs font-mono text-lo mt-0.5">
                {truncateKey(soul.key)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
