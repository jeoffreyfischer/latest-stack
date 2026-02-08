import {
  fetchVersion,
  fetchGcpVersion,
  fetchJavaVersion,
  fetchPythonVersion,
  fetchGoVersion,
  fetchRubyVersion,
  fetchPhpVersion,
  fetchAwsVersion,
  fetchPostgresqlVersion,
  fetchMongodbVersion,
  fetchMysqlVersion,
  fetchDjangoVersion,
} from './fetchVersion'
import type { Stack } from '../types/stack'

async function fetchVersionForStack(
  stack: Omit<Stack, 'latestVersion' | 'isFavorite'>
): Promise<string> {
  if (stack.versionSource === 'gcp') return fetchGcpVersion()
  if (stack.versionSource === 'java') return fetchJavaVersion()
  if (stack.versionSource === 'python') return fetchPythonVersion()
  if (stack.versionSource === 'go') return fetchGoVersion()
  if (stack.versionSource === 'ruby') return fetchRubyVersion()
  if (stack.versionSource === 'php') return fetchPhpVersion()
  if (stack.versionSource === 'aws') return fetchAwsVersion()
  if (stack.versionSource === 'postgresql') return fetchPostgresqlVersion()
  if (stack.versionSource === 'mongodb') return fetchMongodbVersion()
  if (stack.versionSource === 'mysql') return fetchMysqlVersion()
  if (stack.versionSource === 'django') return fetchDjangoVersion()
  const repo = stack.versionRepo ?? stack.githubRepo
  if (!repo) return ''
  return fetchVersion(repo.owner, repo.repo)
}

async function fetchAll(stacks: Omit<Stack, 'latestVersion' | 'isFavorite'>[]): Promise<Map<string, string>> {
  const results = await Promise.allSettled(
    stacks.map(async (stack) => {
      const hasVersionSource =
        stack.versionSource === 'gcp' ||
        stack.versionSource === 'java' ||
        stack.versionSource === 'python' ||
        stack.versionSource === 'go' ||
        stack.versionSource === 'ruby' ||
        stack.versionSource === 'php' ||
        stack.versionSource === 'aws' ||
        stack.versionSource === 'postgresql' ||
        stack.versionSource === 'mongodb' ||
        stack.versionSource === 'mysql' ||
        stack.versionSource === 'django'
      const version =
        hasVersionSource || stack.versionRepo || stack.githubRepo
          ? await fetchVersionForStack(stack)
          : ''
      return { id: stack.id, version }
    })
  )
  const map = new Map<string, string>()
  for (const result of results) {
    if (result.status === 'fulfilled') {
      map.set(result.value.id, result.value.version)
    }
  }
  return map
}

const CACHE_KEY = 'latest-stack-versions-v5'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

/** Synchronously loads cached versions for instant display on mount. */
export function loadCache(): Map<string, string> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, expires } = JSON.parse(raw) as {
      data: Record<string, string>
      expires: number
    }
    if (Date.now() > expires) return null
    const entries = Object.entries(data).filter(([, v]) => v && v.length > 0)
    return entries.length > 0 ? new Map(entries) : null
  } catch {
    return null
  }
}

function saveCache(map: Map<string, string>) {
  try {
    const data = Object.fromEntries([...map.entries()].filter(([, v]) => v && v.length > 0))
    if (Object.keys(data).length === 0) return
    const expires = Date.now() + CACHE_TTL_MS
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, expires }))
  } catch {
    // ignore
  }
}

function hasChanges(prev: Map<string, string>, next: Map<string, string>): boolean {
  if (prev.size !== next.size) return true
  for (const [id, v] of next) {
    if (prev.get(id) !== v) return true
  }
  return false
}

/**
 * Fetches versions for all stacks. Uses stale-while-revalidate:
 * - Only caches non-empty versions (empty versions are never cached)
 * - Returns cached data immediately when available
 * - Runs background fetch; if new versions differ, calls onVersionsUpdate
 */
export async function fetchAllVersions(
  stacks: Omit<Stack, 'latestVersion' | 'isFavorite'>[],
  onVersionsUpdate?: (versions: Map<string, string>) => void
): Promise<Map<string, string>> {
  const cached = loadCache()
  const hasCachedData = cached && cached.size > 0

  if (hasCachedData) {
    const initialMap = new Map(cached)
    void (async () => {
      const fresh = await fetchAll(stacks)
      const merged = new Map(initialMap)
      for (const [id, v] of fresh) {
        if (v) merged.set(id, v)
      }
      saveCache(merged)
      if (hasChanges(initialMap, merged)) {
        onVersionsUpdate?.(merged)
      }
    })()
    return initialMap
  }

  const map = await fetchAll(stacks)
  saveCache(map)
  return map
}
