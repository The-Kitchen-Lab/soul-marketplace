'use client'

import Link from 'next/link'
import type { SoulEntity } from '@/types'
import { SOUL_CATEGORIES } from '@/lib/constants'
import { Terminal, Search, Pen, TrendingUp, Shield, Target, Grid3X3, GitFork, MessageSquare, BarChart2, CandlestickChart, Server, FileText } from 'lucide-react'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  coding: Terminal,
  research: Search,
  creative: Pen,
  analyst: TrendingUp,
  security: Shield,
  strategy: Target,
  debate: MessageSquare,
  analysis: BarChart2,
  trading: CandlestickChart,
  devops: Server,
  writing: FileText,
  other: Grid3X3,
}

function truncateAddr(addr: string) {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function SoulCard({ soul }: { soul: SoulEntity }) {
  const category = SOUL_CATEGORIES.find((c) => c.id === soul.category)
  const Icon = CATEGORY_ICONS[soul.category] ?? Grid3X3
  const price = soul.price && soul.price !== '0' ? soul.price : null

  return (
    <Link href={`/soul/${encodeURIComponent(soul.key)}`} className="block group">
      <div className="bg-surface hover:bg-surface-hi [border-width:0.5px] border-white/[0.07] hover:border-white/[0.14] p-5 transition-colors duration-150 h-full flex flex-col">
        {/* Category row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5">
            <Icon size={10} strokeWidth={1.5} className="text-lo" />
            <span className="text-2xs uppercase tracking-label text-lo">
              {category?.label ?? soul.category}
            </span>
          </div>
          {soul.forkedFrom && (
            <div className="flex items-center gap-1 text-2xs text-lo">
              <GitFork size={10} strokeWidth={1.5} />
              <span>fork</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-hi text-sm font-medium leading-snug mb-2">
            {soul.name}
          </h3>
          <p className="text-mid text-xs leading-relaxed line-clamp-2">
            {soul.description || 'No description provided.'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 [border-top-width:0.5px] border-white/[0.05]">
          <span className="text-2xs font-mono text-lo">
            {truncateAddr(soul.creator)}
          </span>
          {price && (
            <span className="text-2xs font-mono text-lo">
              ${price}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
