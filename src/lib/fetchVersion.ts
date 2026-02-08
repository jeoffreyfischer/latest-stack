function normalizeTag(tag: string): string {
  return tag
    .replace(/^docker-v/, '')  // moby/moby: "docker-v29.2.1" → "29.2.1"
    .replace(/^go/, '')        // golang/go: "go1.22.0" → "1.22.0"
    .replace(/^v/, '')          // standard: "v1.2.3" → "1.2.3"
}

const headers: HeadersInit = {}
const token = (import.meta as { env?: { VITE_GITHUB_TOKEN?: string } }).env?.VITE_GITHUB_TOKEN
if (token) {
  headers.Authorization = `Bearer ${token}`
}

export async function fetchVersion(owner: string, repo: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
      { headers }
    )
    if (res.ok) {
      const data = (await res.json()) as { tag_name: string }
      const tag = data.tag_name ?? ''
      return normalizeTag(tag)
    }
    // Fallback: some repos use tags but not GitHub Releases (404)
    if (res.status === 404) {
      const tagsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/tags?per_page=1`,
        { headers }
      )
      if (!tagsRes.ok) return ''
      const tags = (await tagsRes.json()) as { name: string }[]
      const tag = tags[0]?.name ?? ''
      return normalizeTag(tag)
    }
    return ''
  } catch {
    return ''
  }
}
