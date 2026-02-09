import { useState } from 'react'
import type { Stack } from '../types/stack'
import { WorldIcon, StarIcon } from './icons'

interface StackCardProps {
  stack: Stack
  onToggleFavorite: (id: string) => void
  onCardClick?: (id: string) => void
  isHighlighted?: boolean
}

const LOGO_CDN = 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons'

export function StackCard({ stack, onToggleFavorite, onCardClick, isHighlighted = false }: StackCardProps) {
  const [logoError, setLogoError] = useState(false)
  const logoUrl = stack.iconSlug ? `${LOGO_CDN}/${stack.iconSlug}.svg` : null
  const showLogo = logoUrl && !logoError

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(stack.id)
  }

  const handleCardClick = () => {
    onCardClick?.(stack.id)
  }

  return (
    <div
      data-stack-id={stack.id}
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:border-pink-200 hover:bg-pink-50/30 dark:border-gray-700/80 dark:bg-gray-900 dark:hover:border-pink-900/40 dark:hover:bg-pink-950/50 ${
        isHighlighted ? 'ring-2 ring-pink-500 ring-inset' : ''
      }`}
    >
      {/* Card click area: highlight on click; world icon opens the stack website */}
      <button
        type="button"
        onClick={handleCardClick}
        className="absolute inset-0 z-0 cursor-default focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-inset focus:ring-offset-0"
        aria-label={`Select ${stack.name}`}
      />
      <div className="pointer-events-none relative z-10 flex min-w-0 items-start justify-between gap-2">
        <div className="pointer-events-none flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100 transition-colors group-hover:bg-gray-200/80 dark:bg-gray-800 dark:group-hover:bg-gray-700/80">
            {showLogo ? (
              <img
                src={logoUrl}
                alt=""
                className="h-5 w-5 object-contain dark:invert"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                {stack.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3
              className="truncate font-semibold text-gray-900 dark:text-gray-100"
              title={stack.name}
            >
              {stack.name}
            </h3>
            <p
              className="truncate text-sm font-mono font-medium text-pink-600 dark:text-pink-400"
              title={stack.latestVersion ? `v${stack.latestVersion}` : undefined}
            >
              {stack.latestVersion ? `v${stack.latestVersion}` : '—'}
            </p>
          </div>
        </div>
        <div className="pointer-events-auto flex shrink-0 items-center gap-0.5 self-start">
          <a
            href={stack.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="cursor-pointer rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            aria-label={`Visit ${stack.name} website`}
            title={`Visit ${stack.name} website`}
          >
            <WorldIcon />
          </a>
          <button
            type="button"
            onClick={handleStarClick}
            className={`cursor-pointer rounded p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
              stack.isFavorite
                ? 'text-amber-500 dark:text-amber-400'
                : 'text-gray-400 hover:text-amber-500 dark:hover:text-amber-400'
            }`}
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
    </div>
  )
}
