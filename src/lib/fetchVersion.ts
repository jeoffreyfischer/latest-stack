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
  'https://corsproxy.io/?url=',
  'https://api.cors.lol/?url=',
  'https://api.allorigins.win/raw?url=',
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

const JAVA_API_URL = 'https://api.adoptium.net/v3/info/release_versions?release_type=ga&page_size=1'

export async function fetchJavaVersion(): Promise<string> {
  const parse = (data: unknown): string => {
    const d = data as { versions?: Array<{ openjdk_version?: string; semver?: string }> }
    const v = d.versions?.[0]
    const raw = v?.openjdk_version ?? v?.semver ?? ''
    if (!raw) return ''
    const match = raw.match(/^(\d+\.\d+\.\d+)/)
    return match ? match[1] : raw
  }
  try {
    const res = await fetch(JAVA_API_URL)
    if (res.ok) {
      const data = await res.json()
      const version = parse(data)
      if (version) return version
    }
  } catch {
    // ignore
  }
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(proxy + encodeURIComponent(JAVA_API_URL))
      if (!res.ok) continue
      const data = await res.json()
      const version = parse(data)
      if (version) return version
    } catch {
      continue
    }
  }
  return ''
}

/** Uses GitHub Releases only (no tags fallback). */
export async function fetchVersion(owner: string, repo: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
      { headers }
    )
    if (!res.ok) return ''
    const data = (await res.json()) as { tag_name: string }
    const tag = data.tag_name ?? ''
    return normalizeTag(tag)
  } catch {
    return ''
  }
}

async function fetchEndoflifeVersion(product: string): Promise<string> {
  try {
    const res = await fetch(`https://endoflife.date/api/${product}.json`)
    if (!res.ok) return ''
    const data = (await res.json()) as { latest: string }[]
    return data[0]?.latest ?? ''
  } catch {
    return ''
  }
}

export async function fetchPythonVersion(): Promise<string> {
  return fetchEndoflifeVersion('python')
}

export async function fetchGoVersion(): Promise<string> {
  try {
    const res = await fetch('https://go.dev/dl/?mode=json')
    if (!res.ok) return ''
    const data = (await res.json()) as { version: string; stable: boolean }[]
    const stable = data.find((x) => x.stable)
    return stable ? normalizeTag(stable.version) : ''
  } catch {
    return ''
  }
}

export async function fetchRubyVersion(): Promise<string> {
  return fetchEndoflifeVersion('ruby')
}

export async function fetchPhpVersion(): Promise<string> {
  return fetchEndoflifeVersion('php')
}

/** AWS CLI has no GitHub Releases; uses tags instead. */
export async function fetchAwsVersion(): Promise<string> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/aws/aws-cli/tags?per_page=1',
      { headers }
    )
    if (!res.ok) return ''
    const data = (await res.json()) as { name: string }[]
    const tag = data[0]?.name ?? ''
    return normalizeTag(tag)
  } catch {
    return ''
  }
}

export async function fetchPostgresqlVersion(): Promise<string> {
  return fetchEndoflifeVersion('postgresql')
}

export async function fetchMongodbVersion(): Promise<string> {
  return fetchEndoflifeVersion('mongodb')
}

export async function fetchMysqlVersion(): Promise<string> {
  return fetchEndoflifeVersion('mysql')
}

export async function fetchDjangoVersion(): Promise<string> {
  try {
    const res = await fetch('https://pypi.org/pypi/Django/json')
    if (!res.ok) return ''
    const body = (await res.json()) as { info?: { version?: string } }
    return body.info?.version ?? ''
  } catch {
    return ''
  }
}
