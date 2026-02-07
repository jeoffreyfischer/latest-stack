import { fetchVersion } from './fetchVersion'
import type { Stack } from '../types/stack'

export async function fetchAllVersions(
  stacks: Omit<Stack, 'latestVersion' | 'isFavorite'>[]
): Promise<Map<string, string>> {
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
  return map
}
