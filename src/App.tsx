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
    <div className="min-h-screen bg-mesh">
      <header className="relative border-b border-gray-200/60 bg-white/90 backdrop-blur-md px-4 py-12 dark:border-gray-800/60 dark:bg-gray-950/95 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tighter text-balance sm:text-5xl lg:text-6xl">
              <span className="text-gray-950 dark:text-gray-50">Latest Stack</span>
              <br />
              <span className="mt-2 inline-block bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent dark:from-pink-400 dark:to-blue-400">
                Versions
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-gray-600 dark:text-gray-400 sm:text-lg">
              One hub to view them all
            </p>
          </div>
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6 lg:right-8 lg:top-6">
          <a
            href="https://github.com/jeoffreyfischer/latest-stack"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-200/80 bg-white/80 p-2.5 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-900/80 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="View source on GitHub"
          >
            <GitHubIcon />
          </a>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-lg border border-gray-200/80 bg-white/80 p-2.5 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-900/80 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
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

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        {!isLoading && (anySectionHasMore || favoriteStacks.length > 0) && (
          <div className="flex flex-wrap justify-center gap-2">
            {anySectionHasMore && (
              <button
                type="button"
                onClick={() => setExpandAll((e) => !e)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                {expandAll ? 'Collapse all' : 'Expand all'}
              </button>
            )}
            {favoriteStacks.length > 0 && (
              <button
                type="button"
                onClick={clearAllFavorites}
                className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
              >
                Clear favorites
              </button>
            )}
          </div>
        )}
        {!isLoading && versions.size === 0 && (
          <p className="text-center text-sm text-amber-600 dark:text-amber-400">
            Could not fetch versions (GitHub API rate limit?). Add{' '}
            <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
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

      <footer className="mt-20 border-t border-gray-200/60 bg-white/50 px-4 py-10 dark:border-gray-800/60 dark:bg-gray-950/50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <p className="max-w-xl">
              Versions from GitHub Releases, endoflife.date, npm, and official APIs.
            </p>
            <p className="font-medium text-gray-400 dark:text-gray-500">© {new Date().getFullYear()} Latest Stack</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
