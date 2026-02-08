import { useState, useCallback } from 'react'

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

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites)

  const toggleFavorite = useCallback((id: string) => {
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
  }, [])

  const clearAllFavorites = useCallback(() => {
    setFavorites(new Set())
    saveFavorites(new Set())
  }, [])

  return { favorites, toggleFavorite, clearAllFavorites }
}
