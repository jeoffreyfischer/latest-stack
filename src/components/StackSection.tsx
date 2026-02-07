import type { Stack } from '../types/stack'
import { StackCard } from './StackCard'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../data/stacks'

interface StackSectionProps {
  category: string
  stacks: Stack[]
  onToggleFavorite: (id: string) => void
}

export function StackSection({ category, stacks, onToggleFavorite }: StackSectionProps) {
  const label = CATEGORY_LABELS[category] ?? category
  const colorClass = CATEGORY_COLORS[category] ?? 'border-slate-500/30 bg-slate-500/5'

  return (
    <section className={`rounded-xl border p-4 ${colorClass}`}>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
        {label}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stacks.map((stack) => (
          <StackCard key={stack.id} stack={stack} onToggleFavorite={onToggleFavorite} />
        ))}
      </div>
    </section>
  )
}
