import { useState } from 'react'
import type { Stack } from '../types/stack'

interface StackCardProps {
  stack: Stack
  onToggleFavorite: (id: string) => void
}

const LOGO_CDN = 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons'

export function StackCard({ stack, onToggleFavorite }: StackCardProps) {
  const [logoError, setLogoError] = useState(false)
  const logoUrl = stack.iconSlug ? `${LOGO_CDN}/${stack.iconSlug}.svg` : null
  const showLogo = logoUrl && !logoError

  const handleCardClick = () => {
    window.open(stack.url, '_blank', 'noopener,noreferrer')
  }

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(stack.id)
  }

  const handleVersionLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const hasVersionLink = !!stack.versionUrl || !!stack.githubRepo
  const versionLinkUrl = stack.versionUrl
    ? stack.versionUrl
    : stack.githubRepo
      ? `https://github.com/${stack.githubRepo.owner}/${stack.githubRepo.repo}/releases`
      : null
  const useWorldIcon = !!stack.versionUrl

  return (
    <div
      onClick={handleCardClick}
      className="group flex cursor-pointer flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:border-emerald-300/50 hover:shadow-lg hover:shadow-emerald-500/5 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-slate-600 dark:hover:shadow-slate-900/20"
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
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">
              {stack.name}
            </h3>
            <p className="text-sm font-mono font-medium text-emerald-600 dark:text-emerald-400">
              {stack.latestVersion ? `v${stack.latestVersion}` : '—'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {hasVersionLink && versionLinkUrl && (
            <a
              href={versionLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleVersionLinkClick}
              className="cursor-pointer rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              aria-label={useWorldIcon ? 'View version info' : 'View releases on GitHub'}
            >
              {useWorldIcon ? <WorldIcon /> : <GitHubIcon />}
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

function GitHubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function WorldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
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
