import { useState, useEffect, useMemo } from 'react'
import { StackSection } from './components/StackSection'
import { LoadingOverlay } from './components/LoadingOverlay'
import { GitHubIcon, SunIcon, MoonIcon } from './components/icons'
import { useInitialVisibleCount } from './hooks/useInitialVisibleCount'
import { useTheme } from './hooks/useTheme'
import { useFavorites } from './hooks/useFavorites'
import { STACK_DEFINITIONS, CATEGORY_ORDER } from './data/stacks'
import { fetchAllVersions, getInitialVersionState } from './lib/fetchVersions'
import type { Stack } from './types/stack'

const initialVersionState = getInitialVersionState()

export default function App() {
  const [theme, setTheme] = useTheme()
  const { favorites, toggleFavorite, clearAllFavorites } = useFavorites()
  const [versions, setVersions] = useState<Map<string, string>>(
    () => initialVersionState.versions
  )
  const [isLoading, setIsLoading] = useState(
    () => initialVersionState.isLoading
  )
  const [expandAll, setExpandAll] = useState(false)
  const initialCount = useInitialVisibleCount()

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
    return CATEGORY_ORDER
      .filter((c) => map.has(c))
      .map((category) => {
        let categoryStacks = map.get(category) ?? []
        // Remove stray "R" from tooling (R language belongs in Languages, not Tooling)
        if (category === 'tooling') {
          categoryStacks = categoryStacks.filter((s) => s.name !== 'R')
        }
        return {
          category,
          stacks: [...categoryStacks].sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
          ),
        }
      })
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
              <span className="text-gradient">Latest Stack Versions</span>
              <br />
              <span className="mt-3 inline-block pb-[0.2em] bg-gradient-to-r from-emerald-600 via-cyan-500 to-violet-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-cyan-400 dark:to-violet-400">
                One Dashboard. Always Current.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg">
              Stay up-to-date with the official versions of languages, frameworks, tools and more
            </p>
          </div>
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6 lg:right-8 lg:top-6">
          <a
            href="https://github.com/jeoffreyfischer/latest-stack"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-slate-200/60 bg-white/60 p-2.5 text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="View source on GitHub"
          >
            <GitHubIcon />
          </a>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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
        {!isLoading && versions.size === 0 && (
          <p className="text-center text-sm text-amber-600 dark:text-amber-400">
            Could not fetch versions (GitHub API rate limit?). Add{' '}
            <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">
              VITE_GITHUB_TOKEN
            </code>{' '}
            to .env or try again later.
          </p>
        )}

        <div className="relative space-y-8">
          <LoadingOverlay show={isLoading} />
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
        </div>
      </main>

      <footer className="mt-16 border-t border-slate-200/80 bg-white/50 px-4 py-8 dark:border-slate-700/50 dark:bg-slate-950/50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-6 text-center text-sm text-slate-500 dark:text-slate-400">
            <p className="max-w-xl">
              Versions are fetched from GitHub Releases, endoflife.date, registries, and official APIs.
            </p>
            <p>© {new Date().getFullYear()} Latest Stack</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
