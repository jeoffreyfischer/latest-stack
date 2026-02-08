export type StackCategory =
  | 'language'
  | 'frontend'
  | 'backend'
  | 'devops'
  | 'mobile'
  | 'tooling'
  | 'database'
  | 'cloud'
  | 'testing'

export interface Stack {
  id: string
  name: string
  category: StackCategory
  logo: string
  latestVersion: string
  url: string
  isFavorite: boolean
  githubRepo?: { owner: string; repo: string }
  /** Simple Icons slug for CDN logo (cdn.jsdelivr.net/npm/simple-icons) */
  iconSlug?: string
  /** When 'gcp', fetch from Google Cloud SDK. When 'java', fetch from Adoptium API (latest production JDK). */
  versionSource?: 'github' | 'gcp' | 'java'
  /** Override repo for version fetch (e.g. when main url differs from version source) */
  versionRepo?: { owner: string; repo: string }
  /** URL to version/release info when not from GitHub (e.g. GCP release notes) */
  versionUrl?: string
  /** When 'tags', link to GitHub tags page instead of releases (for repos that use tags but not Releases) */
  versionLink?: 'releases' | 'tags'
}
