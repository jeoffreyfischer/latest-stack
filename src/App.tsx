import { useState, useEffect, useMemo } from 'react'
import { StackSection } from './components/StackSection'
import { STACK_DEFINITIONS } from './data/stacks'
import { fetchAllVersions } from './lib/fetchVersions'
import type { Stack } from './types/stack'

const FAVORITES_KEY = 'latest-stack-favorites'

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

export default function App() {
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites)
  const [versions, setVersions] = useState<Map<string, string>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAllVersions(STACK_DEFINITIONS)
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

  const favoriteStacks = useMemo(
    () => stacks.filter((s) => s.isFavorite),
    [stacks]
  )

  const stacksByCategory = useMemo(() => {
    const map = new Map<string, Stack[]>()
    for (const stack of stacks) {
      const list = map.get(stack.category) ?? []
      list.push(stack)
      map.set(stack.category, list)
    }
    const order = ['language', 'frontend', 'backend', 'devops', 'mobile', 'tooling']
    return order
      .filter((c) => map.has(c))
      .map((category) => ({ category, stacks: map.get(category)! }))
  }, [stacks])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Latest Stack
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Track the latest versions of popular developer tools and frameworks
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {isLoading && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Fetching latest versions…
          </p>
        )}

        {favoriteStacks.length > 0 && (
          <StackSection
            category="favorites"
            stacks={favoriteStacks}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {stacksByCategory.map(({ category, stacks: categoryStacks }) => (
          <StackSection
            key={category}
            category={category}
            stacks={categoryStacks}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </main>
    </div>
  )
}
