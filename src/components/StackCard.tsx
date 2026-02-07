import type { Stack } from '../types/stack'

interface StackCardProps {
  stack: Stack
  onToggleFavorite: (id: string) => void
}

export function StackCard({ stack, onToggleFavorite }: StackCardProps) {
  const handleCardClick = () => {
    window.open(stack.url, '_blank', 'noopener,noreferrer')
  }

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(stack.id)
  }

  return (
    <div
      onClick={handleCardClick}
      className="group flex cursor-pointer flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {stack.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">
              {stack.name}
            </h3>
            <p className="text-sm font-mono font-medium text-emerald-600 dark:text-emerald-400">
              v{stack.latestVersion}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleStarClick}
          className="shrink-0 rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-amber-500 dark:hover:bg-slate-700 dark:hover:text-amber-400"
          aria-label={stack.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {stack.isFavorite ? (
            <StarIcon filled />
          ) : (
            <StarIcon />
          )}
        </button>
      </div>
    </div>
  )
}

function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  )
}
