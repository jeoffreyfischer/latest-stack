import { useState, useEffect, useMemo } from 'react'
import { StackSection } from './components/StackSection'
import { useInitialVisibleCount } from './hooks/useInitialVisibleCount'
import { STACK_DEFINITIONS } from './data/stacks'
import { fetchAllVersions, getInitialVersionState } from './lib/fetchVersions'
import type { Stack } from './types/stack'

const FAVORITES_KEY = 'latest-stack-favorites'
const THEME_KEY = 'latest-stack-theme'

function loadTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // ignore
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function loadFavorites(): Set<string> {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as string[]
      return new Set(parsed)
    }
  } catch {
    // ignore
  }
  return new Set()
}

function saveFavorites(favorites: Set<string>) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]))
}

const initialVersionState = getInitialVersionState()

export default function App() {
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites)
  const [versions, setVersions] = useState<Map<string, string>>(
    () => initialVersionState.versions
  )
  const [isLoading, setIsLoading] = useState(
    () => initialVersionState.isLoading
  )
  const [theme, setTheme] = useState<'light' | 'dark'>(loadTheme)
  const [expandAll, setExpandAll] = useState(false)
  const initialCount = useInitialVisibleCount()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    fetchAllVersions(STACK_DEFINITIONS, setVersions)
      .then(setVersions)
      .finally(() => setIsLoading(false))
  }, [])

  const stacks = useMemo(() => {
    return STACK_DEFINITIONS.map((def) => ({
      ...def,
      latestVersion: versions.get(def.id) ?? '',
      isFavorite: favorites.has(def.id),
    }))
  }, [versions, favorites])

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      saveFavorites(next)
      return next
    })
  }

  const clearAllFavorites = () => {
    setFavorites(new Set())
    saveFavorites(new Set())
  }

  const favoriteStacks = useMemo(
    () =>
      stacks
        .filter((s) => s.isFavorite)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
    [stacks]
  )

  const stacksByCategory = useMemo(() => {
    const map = new Map<string, Stack[]>()
    for (const stack of stacks) {
      const list = map.get(stack.category) ?? []
      list.push(stack)
      map.set(stack.category, list)
    }
    const order = ['language', 'frontend', 'backend', 'tooling', 'database', 'testing', 'devops', 'mobile', 'cloud']
    return order
      .filter((c) => map.has(c))
      .map((category) => ({
        category,
        stacks: [...(map.get(category) ?? [])].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        ),
      }))
  }, [stacks])

  const anySectionHasMore =
    (favoriteStacks.length > 0 && favoriteStacks.length > initialCount) ||
    stacksByCategory.some(({ stacks: s }) => s.length > initialCount)

  return (
    <div className="min-h-screen bg-slate-50 bg-mesh dark:bg-slate-900">
      <header className="relative border-b border-slate-200/80 bg-white/80 backdrop-blur-sm px-4 py-10 dark:border-slate-700/50 dark:bg-slate-950/90 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              <span className="text-gradient">Latest Stack versions</span>
              <br />
              <span className="mt-1 inline-block bg-gradient-to-r from-emerald-600 via-cyan-500 to-violet-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-cyan-400 dark:to-violet-400">
                One Dashboard. Instantly.
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg">
              Stay ahead of the curve with the most up-to-date versions of programming languages, frontend & backend frameworks, mobile platforms, DevOps tools, and developer utilities - all pulled automatically from official sources
            </p>
          </div>
        </div>
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6 lg:right-8 lg:top-6">
          <button
            type="button"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className="rounded-xl border border-slate-200/60 bg-white/60 p-2.5 text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <SunIcon />
            ) : (
              <MoonIcon />
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {!isLoading && (anySectionHasMore || favoriteStacks.length > 0) && (
          <div className="flex flex-wrap justify-center gap-2">
            {anySectionHasMore && (
              <button
                type="button"
                onClick={() => setExpandAll((e) => !e)}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                {expandAll ? 'Collapse all' : 'Expand all'}
              </button>
            )}
            {favoriteStacks.length > 0 && (
              <button
                type="button"
                onClick={clearAllFavorites}
                className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-2 text-sm font-medium text-amber-700 shadow-sm transition-all hover:border-amber-300 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400 dark:hover:border-amber-700 dark:hover:bg-amber-900/50"
              >
                Clear favorites
              </button>
            )}
          </div>
        )}
        {isLoading && (
          <p className="flex items-center justify-center gap-2 text-center text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
            Fetching latest versions…
          </p>
        )}

        {!isLoading && versions.size === 0 && (
          <p className="text-center text-sm text-amber-600 dark:text-amber-400">
            Could not fetch versions (GitHub API rate limit?). Add{' '}
            <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">
              VITE_GITHUB_TOKEN
            </code>{' '}
            to .env or try again later.
          </p>
        )}

        {favoriteStacks.length > 0 && (
          <StackSection
            category="favorites"
            stacks={favoriteStacks}
            onToggleFavorite={toggleFavorite}
            expandAll={expandAll}
            initialCount={initialCount}
          />
        )}

        {stacksByCategory.map(({ category, stacks: categoryStacks }) => (
          <StackSection
            key={category}
            category={category}
            stacks={categoryStacks}
            onToggleFavorite={toggleFavorite}
            expandAll={expandAll}
            initialCount={initialCount}
          />
        ))}
      </main>
    </div>
  )
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}
