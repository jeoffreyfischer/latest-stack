import { useState } from 'react'
import type { Stack } from '../types/stack'
import { TagIcon, StarIcon } from './icons'

interface StackCardProps {
  stack: Stack
  onToggleFavorite: (id: string) => void
}

const LOGO_CDN = 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons'

export function StackCard({ stack, onToggleFavorite }: StackCardProps) {
  const [logoError, setLogoError] = useState(false)
  const logoUrl = stack.iconSlug ? `${LOGO_CDN}/${stack.iconSlug}.svg` : null
  const showLogo = logoUrl && !logoError

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(stack.id)
  }

  const hasVersionLink = !!stack.versionUrl || !!stack.githubRepo
  const versionLinkUrl = stack.versionUrl
    ? stack.versionUrl
    : stack.githubRepo
      ? `https://github.com/${stack.githubRepo.owner}/${stack.githubRepo.repo}/releases`
      : null

  return (
    <div className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:border-emerald-300/50 hover:shadow-lg hover:shadow-emerald-500/5 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-slate-600 dark:hover:shadow-slate-900/20">
      {/* Stretched link: covers whole card; content uses pointer-events-none so clicks reach it; actions use pointer-events-auto */}
      <a
        href={stack.url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset focus:ring-offset-0"
        aria-label={`Visit ${stack.name}`}
      />
      <div className="pointer-events-none relative z-10 flex min-w-0 items-start justify-between gap-2">
        <div className="pointer-events-none flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/50 transition-colors group-hover:bg-slate-50 dark:bg-slate-700 dark:ring-slate-600/50 dark:group-hover:bg-slate-700/90">
            {showLogo ? (
              <img
                src={logoUrl}
                alt=""
                className="h-6 w-6 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-lg font-semibold text-slate-600 dark:text-slate-300">
                {stack.name.charAt(0)}
              </span>
            )}
          </div>
          <div
            className="pointer-events-auto min-w-0 flex-1 cursor-pointer overflow-hidden"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.open(stack.url, '_blank', 'noopener,noreferrer')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                window.open(stack.url, '_blank', 'noopener,noreferrer')
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Visit ${stack.name}`}
          >
            <h3
              className="truncate font-semibold text-slate-900 dark:text-slate-100"
              title={stack.name}
            >
              {stack.name}
            </h3>
            <p
              className="truncate text-sm font-mono font-medium text-emerald-600 dark:text-emerald-400"
              title={stack.latestVersion ? `v${stack.latestVersion}` : undefined}
            >
              {stack.latestVersion ? `v${stack.latestVersion}` : '—'}
            </p>
          </div>
        </div>
        <div className="pointer-events-auto flex shrink-0 items-center gap-0.5 self-start">
          {hasVersionLink && versionLinkUrl && (
            <a
              href={versionLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              aria-label="Link to version page"
              title="Link to version page"
            >
              <TagIcon />
            </a>
          )}
          <button
            type="button"
            onClick={handleStarClick}
            className={`cursor-pointer rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${
              stack.isFavorite
                ? 'text-amber-500 dark:text-amber-400'
                : 'text-slate-400 hover:text-amber-500 dark:hover:text-amber-400'
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
