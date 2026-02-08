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

const GCP_COMPONENTS_URL = 'https://dl.google.com/dl/cloudsdk/channels/rapid/components-2.json'
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?url=',
]

export async function fetchGcpVersion(): Promise<string> {
  const encoded = encodeURIComponent(GCP_COMPONENTS_URL)
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(proxy + encoded)
      if (!res.ok) continue
      const data = (await res.json()) as {
        components?: Array<{
          id?: string
          version?: { version_string?: string }
        }>
      }
      const core = data.components?.find((c) => c.id === 'core')
      const version = core?.version?.version_string ?? ''
      if (version) return version
      const fallback = data.components?.find((c) =>
        ['beta', 'alpha'].includes(c.id ?? '')
      )
      if (fallback?.version?.version_string) return fallback.version.version_string
    } catch {
      continue
    }
  }
  return ''
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
