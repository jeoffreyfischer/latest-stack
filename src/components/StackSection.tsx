import { useState, useEffect } from 'react'
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
  isLoading?: boolean
  highlightedStackId?: string | null
  expandedForSearch?: Set<string>
  individuallyCollapsed?: Set<string>
  collapseKey?: number
  onClearExpandedForSearch?: (category: string) => void
  onToggleIndividuallyCollapsed?: (category: string) => void
  onClearFavorites?: () => void
}

export function StackSection({
  category,
  stacks,
  onToggleFavorite,
  expandAll = false,
  initialCount: initialCountProp,
  isLoading = false,
  highlightedStackId = null,
  expandedForSearch = new Set(),
  individuallyCollapsed = new Set(),
  collapseKey = 0,
  onClearExpandedForSearch,
  onToggleIndividuallyCollapsed,
  onClearFavorites,
}: StackSectionProps) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setExpanded(false)
  }, [collapseKey])
  const internalCount = useInitialVisibleCount()
  const initialCount = initialCountProp ?? internalCount

  const label = CATEGORY_LABELS[category] ?? category
  const colorClass = CATEGORY_COLORS[category] ?? 'border-slate-500/30 bg-slate-500/5'

  const isExpanded = expandAll
    ? !individuallyCollapsed.has(category)
    : expanded || expandedForSearch.has(category)
  const visibleStacks = isExpanded ? stacks : stacks.slice(0, initialCount)
  const hasMore = stacks.length > initialCount
  const showPerSectionToggle = hasMore

  return (
    <section className={`relative rounded-2xl border p-5 shadow-sm transition-colors ${colorClass}`}>
      {category === 'favorites' && onClearFavorites && (
        <button
          type="button"
          onClick={onClearFavorites}
          className="absolute right-4 top-4 rounded p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
          aria-label="Clear all favorites"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
      <h2 className={`mb-4 text-lg font-semibold uppercase tracking-widest sm:text-xl ${category === 'favorites' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'} ${category === 'favorites' && onClearFavorites ? 'pr-8' : ''}`}>
        {label}
        {isLoading && stacks.some((s) => !s.latestVersion?.trim()) && (
          <span className="ml-3 inline-flex items-center gap-2 rounded-full border border-pink-200/60 bg-gradient-to-r from-pink-500/10 to-blue-500/10 px-3 py-1 text-xs font-medium tracking-wide text-pink-600 dark:border-pink-800/40 dark:from-pink-500/15 dark:to-blue-500/15 dark:text-pink-400">
            <span
              className="h-2.5 w-2.5 shrink-0 animate-spin rounded-full border-2 border-pink-200 border-t-pink-500 dark:border-pink-800 dark:border-t-pink-400"
              aria-hidden
            />
            Loading
          </span>
        )}
      </h2>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>*]:min-w-0">
        {visibleStacks.map((stack) => (
          <StackCard
            key={stack.id}
            stack={stack}
            onToggleFavorite={onToggleFavorite}
            isHighlighted={highlightedStackId === stack.id}
          />
        ))}
      </div>
      {showPerSectionToggle && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (expandAll) {
                onToggleIndividuallyCollapsed?.(category)
              } else {
                setExpanded((e) => !e)
                onClearExpandedForSearch?.(category)
              }
            }}
            className="w-fit cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            {isExpanded ? 'See less' : `See more (${stacks.length - initialCount} more)`}
          </button>
        </div>
      )}
    </section>
  )
}
