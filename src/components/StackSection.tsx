import { useState } from 'react'
import type { Stack } from '../types/stack'
import { StackCard } from './StackCard'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../data/stacks'
import { useInitialVisibleCount } from '../hooks/useInitialVisibleCount'

interface StackSectionProps {
  category: string
  stacks: Stack[]
  onToggleFavorite: (id: string) => void
  expandAll?: boolean
  initialCount?: number
}

export function StackSection({
  category,
  stacks,
  onToggleFavorite,
  expandAll = false,
  initialCount: initialCountProp,
}: StackSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const internalCount = useInitialVisibleCount()
  const initialCount = initialCountProp ?? internalCount

  const label = CATEGORY_LABELS[category] ?? category
  const colorClass = CATEGORY_COLORS[category] ?? 'border-slate-500/30 bg-slate-500/5'

  const visibleStacks = expandAll || expanded ? stacks : stacks.slice(0, initialCount)
  const hasMore = stacks.length > initialCount
  const showPerSectionToggle = hasMore && !expandAll

  return (
    <section className={`rounded-2xl border p-5 transition-colors ${colorClass}`}>
      <h2 className="mb-4 text-lg font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 sm:text-xl">
        {label}
      </h2>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>*]:min-w-0">
        {visibleStacks.map((stack) => (
          <StackCard key={stack.id} stack={stack} onToggleFavorite={onToggleFavorite} />
        ))}
      </div>
      {showPerSectionToggle && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="w-fit cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            {expanded ? 'See less' : `See more (${stacks.length - initialCount} more)`}
          </button>
        </div>
      )}
    </section>
  )
}
