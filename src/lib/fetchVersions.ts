import { fetchVersion } from './fetchVersion'
import type { Stack } from '../types/stack'

const CACHE_KEY = 'latest-stack-versions'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

function loadCache(): Map<string, string> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, expires } = JSON.parse(raw) as {
      data: Record<string, string>
      expires: number
    }
    if (Date.now() > expires) return null
    return new Map(Object.entries(data))
  } catch {
    return null
  }
}

function saveCache(map: Map<string, string>) {
  try {
    const data = Object.fromEntries(map)
    const expires = Date.now() + CACHE_TTL_MS
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, expires }))
  } catch {
    // ignore
  }
}

function hasValidVersions(map: Map<string, string>): boolean {
  for (const v of map.values()) {
    if (v && v.length > 0) return true
  }
  return false
}

export async function fetchAllVersions(
  stacks: Omit<Stack, 'latestVersion' | 'isFavorite'>[]
): Promise<Map<string, string>> {
  const cached = loadCache()
  if (cached && hasValidVersions(cached)) {
    return cached
  }

  const results = await Promise.allSettled(
    stacks.map(async (stack) => {
      const repo = stack.githubRepo
      if (!repo) return { id: stack.id, version: '' }
      const version = await fetchVersion(repo.owner, repo.repo)
      return { id: stack.id, version }
    })
  )

  const map = new Map<string, string>()
  for (const result of results) {
    if (result.status === 'fulfilled') {
      map.set(result.value.id, result.value.version)
    }
  }

  if (hasValidVersions(map)) {
    saveCache(map)
  }

  return map
}
