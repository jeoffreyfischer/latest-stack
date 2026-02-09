function normalizeTag(tag: string): string {
  return tag
    .replace(/^docker-v/, '')       // moby/moby: "docker-v29.2.1" → "29.2.1"
    .replace(/^go/, '')             // golang/go: "go1.22.0" → "1.22.0"
    .replace(/^swift-/, '')         // swiftlang/swift: "swift-6.2.3-RELEASE" → "6.2.3-RELEASE"
    .replace(/-RELEASE$/i, '')      // "6.2.3-RELEASE" → "6.2.3"
    .replace(/^(vesion|version)-/, '')  // sqlite/sqlite: "version-3.51.2" or "vesion-3.45.1" → "3.51.2"
    .replace(/^v/, '')              // standard: "v1.2.3" → "1.2.3"
}

const headers: HeadersInit = {}
const token = (import.meta as { env?: { VITE_GITHUB_TOKEN?: string } }).env?.VITE_GITHUB_TOKEN
if (token) {
  headers.Authorization = `Bearer ${token}`
}

/** Proxies that use ?url= with encoded target URL */
const CORS_PROXIES_ENCODED = [
  'https://api.allorigins.win/raw?url=',
  'https://api.cors.lol/?url=',
]

/** Proxies that append raw URL (e.g. cors-anywhere.com/URL) */
const CORS_PROXIES_RAW = [
  'https://cors-anywhere.com/',
]

async function fetchWithCorsProxy(url: string, parse: (data: unknown) => string): Promise<string> {
  const encoded = encodeURIComponent(url)
  const proxiesEncoded = CORS_PROXIES_ENCODED.map((p) => p + encoded)
  const proxiesRaw = CORS_PROXIES_RAW.map((p) => p + url)
  const allUrls = [...proxiesEncoded, ...proxiesRaw]

  for (const proxyUrl of allUrls) {
    try {
      const res = await fetch(proxyUrl)
      if (!res.ok) continue
      const data = await res.json()
      const v = parse(data)
      if (v) return v
    } catch {
      continue
    }
  }
  return ''
}

/** GCP SDK: use actions-hub/gcloud GitHub releases (CORS-friendly; mirrors official gcloud versions). */
export async function fetchGcpVersion(): Promise<string> {
  return fetchVersion('actions-hub', 'gcloud')
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
  return fetchWithCorsProxy(JAVA_API_URL, parse)
}

/** Fetches latest version from GitHub tags (e.g. repos that don't use Releases). */
async function fetchVersionFromTags(owner: string, repo: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/tags?per_page=1`,
      { headers }
    )
    if (!res.ok) return ''
    const data = (await res.json()) as { name: string }[]
    const tag = data[0]?.name ?? ''
    return tag ? normalizeTag(tag) : ''
  } catch {
    return ''
  }
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
  return fetchVersionFromTags('aws', 'aws-cli')
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

export async function fetchElixirVersion(): Promise<string> {
  return fetchEndoflifeVersion('elixir')
}

export async function fetchVisualStudioVersion(): Promise<string> {
  try {
    const res = await fetch('https://endoflife.date/api/visual-studio.json')
    if (!res.ok) return ''
    const data = (await res.json()) as { cycle: string; latest: string }[]
    // First cycle is newest; use its latest patch version
    const cycle = data[0]
    return cycle?.latest ?? cycle?.cycle ?? ''
  } catch {
    return ''
  }
}

const CURSOR_VERSIONS_API = 'https://cursor-versions.selfhoster.nl/api/v1/versions?version=latest'

/** Cursor IDE has no official releases API; uses community cursor-versions-api. */
export async function fetchCursorVersion(): Promise<string> {
  try {
    const res = await fetch(CURSOR_VERSIONS_API)
    if (!res.ok) return ''
    const data = (await res.json()) as { version?: string }
    return data.version ?? ''
  } catch {
    return ''
  }
}

/** Dart SDK uses tags, not GitHub Releases. */
export async function fetchDartVersion(): Promise<string> {
  return fetchVersionFromTags('dart-lang', 'sdk')
}

/** SQLite uses tags (version-X.Y.Z or vesion-X.Y.Z typo), not GitHub Releases. */
export async function fetchSqliteVersion(): Promise<string> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/sqlite/sqlite/tags?per_page=30',
      { headers }
    )
    if (!res.ok) return ''
    const data = (await res.json()) as { name: string }[]
    let best = ''
    for (const t of data) {
      const v = normalizeTag(t.name)
      if (v && (!best || compareSemver(v, best) > 0)) best = v
    }
    return best
  } catch {
    return ''
  }
}

function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? 0
    const y = pb[i] ?? 0
    if (x !== y) return x - y
  }
  return 0
}

async function fetchNpmVersion(packageName: string): Promise<string> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${packageName}/latest`)
    if (!res.ok) return ''
    const body = (await res.json()) as { version?: string }
    return body.version ?? ''
  } catch {
    return ''
  }
}

export async function fetchExpoVersion(): Promise<string> {
  return fetchNpmVersion('expo')
}

const GITLAB_RUNNER_API = 'https://gitlab.com/api/v4/projects/gitlab-org%2Fgitlab-runner/releases?per_page=1'

const R_HUB_API = 'https://api.r-hub.io/rversions/r-release'

/** R-hub API has no CORS; use proxy only. */
export async function fetchRVersion(): Promise<string> {
  return fetchWithCorsProxy(R_HUB_API, (d) => (d as { version?: string }).version ?? '')
}

/** Qwik framework: GitHub latest is eslint-plugin; use npm @builder.io/qwik. */
export async function fetchQwikVersion(): Promise<string> {
  return fetchNpmVersion('@builder.io/qwik')
}

const HEX_PHOENIX_URL = 'https://hex.pm/api/packages/phoenix'

/** Phoenix: hex.pm API allows CORS; no proxy needed. */
export async function fetchPhoenixVersion(): Promise<string> {
  try {
    const res = await fetch(HEX_PHOENIX_URL)
    if (res.ok) {
      const data = (await res.json()) as { latest_stable_version?: string }
      return data.latest_stable_version ?? ''
    }
  } catch {
    // ignore
  }
  return ''
}

/** Alpine.js: npm registry. */
export async function fetchAlpinejsVersion(): Promise<string> {
  return fetchNpmVersion('alpinejs')
}

/** HTMX: npm registry (htmx.org package). */
export async function fetchHtmxVersion(): Promise<string> {
  return fetchNpmVersion('htmx.org')
}

/** Apollo Server: npm @apollo/server. */
export async function fetchApolloServerVersion(): Promise<string> {
  return fetchNpmVersion('@apollo/server')
}

/** GraphQL.js: npm graphql. */
export async function fetchGraphqlVersion(): Promise<string> {
  return fetchNpmVersion('graphql')
}

/** Deno: GitHub releases (denoland/deno). */
export async function fetchDenoVersion(): Promise<string> {
  return fetchVersion('denoland', 'deno')
}

/** Corepack: GitHub releases (nodejs/corepack). */
export async function fetchCorepackVersion(): Promise<string> {
  return fetchVersion('nodejs', 'corepack')
}

/** OpenSearch: GitHub releases. */
export async function fetchOpensearchVersion(): Promise<string> {
  return fetchVersion('opensearch-project', 'OpenSearch')
}

/** DynamoDB: AWS managed service; track @aws-sdk/client-dynamodb from npm. */
export async function fetchDynamodbVersion(): Promise<string> {
  return fetchNpmVersion('@aws-sdk/client-dynamodb')
}

/** JUnit: GitHub releases (junit-team/junit5). */
export async function fetchJunitVersion(): Promise<string> {
  return fetchVersion('junit-team', 'junit5')
}

/** Nix: uses tags, not GitHub Releases. */
export async function fetchNixVersion(): Promise<string> {
  return fetchVersionFromTags('NixOS', 'nix')
}

/** Talos Linux: GitHub releases (siderolabs/talos). */
export async function fetchTalosVersion(): Promise<string> {
  return fetchVersion('siderolabs', 'talos')
}

/** HTTP: current major version (HTTP/3). No public API; return known version. */
export async function fetchHttpVersion(): Promise<string> {
  return '3'
}

/** TLS: current version (TLS 1.3). No public API; return known version. */
export async function fetchTlsVersion(): Promise<string> {
  return '1.3'
}

/** OAuth: current version (OAuth 2.1). No public API; return known version. */
export async function fetchOauthVersion(): Promise<string> {
  return '2.1'
}

/** JSON Schema: npm package version. */
export async function fetchJsonSchemaVersion(): Promise<string> {
  return fetchNpmVersion('json-schema')
}

/** GitLab Runner is on GitLab.com, not GitHub; try direct fetch first, then proxy. */
export async function fetchGitlabRunnerVersion(): Promise<string> {
  try {
    const res = await fetch(GITLAB_RUNNER_API)
    if (res.ok) {
      const data = (await res.json()) as { tag_name?: string }[]
      const tag = data[0]?.tag_name ?? ''
      return tag ? normalizeTag(tag) : ''
    }
  } catch {
    // fall through to proxy
  }
  const tag = await fetchWithCorsProxy(
    GITLAB_RUNNER_API,
    (d) => (d as { tag_name?: string }[])[0]?.tag_name ?? ''
  )
  return tag ? normalizeTag(tag) : ''
}
