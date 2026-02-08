import { useState } from 'react'
import type { Stack } from '../types/stack'
import { StackCard } from './StackCard'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../data/stacks'
import { useInitialVisibleCount } from '../hooks/useInitialVisibleCount'

interface StackSectionProps {
  category: string
  stacks: Stack[]
  onToggleFavorite: (id: string) => void
}

export function StackSection({ category, stacks, onToggleFavorite }: StackSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const initialCount = useInitialVisibleCount()

  const label = CATEGORY_LABELS[category] ?? category
  const colorClass = CATEGORY_COLORS[category] ?? 'border-slate-500/30 bg-slate-500/5'

  const visibleStacks = expanded ? stacks : stacks.slice(0, initialCount)
  const hasMore = stacks.length > initialCount

  return (
    <section className={`rounded-xl border p-4 ${colorClass}`}>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
        {label}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visibleStacks.map((stack) => (
          <StackCard key={stack.id} stack={stack} onToggleFavorite={onToggleFavorite} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="w-fit cursor-pointer rounded-lg border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          {expanded ? 'See less' : `See more (${stacks.length - initialCount} more)`}
        </button>
        </div>
      )}
    </section>
  )
}
