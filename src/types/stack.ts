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
  /** When 'gcp', fetch version from Google Cloud SDK components JSON instead of GitHub */
  versionSource?: 'github' | 'gcp'
  /** Override repo for version fetch (e.g. when main url differs from version source) */
  versionRepo?: { owner: string; repo: string }
}
