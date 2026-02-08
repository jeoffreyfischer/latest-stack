export type StackCategory =
  | 'language'
  | 'frontend'
  | 'backend'
  | 'devops'
  | 'mobile'
  | 'tooling'
  | 'editors'
  | 'cicd'
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
  /** When set, fetch from this source instead of GitHub Releases. */
  versionSource?: 'gcp' | 'java' | 'python' | 'go' | 'ruby' | 'php' | 'aws' | 'postgresql' | 'mongodb' | 'mysql' | 'django' | 'elixir' | 'dart' | 'sqlite' | 'expo' | 'gitlab-runner' | 'r' | 'visualstudio' | 'cursor' | 'qwik' | 'phoenix' | 'alpinejs' | 'htmx' | 'apollo-server' | 'graphql' | 'deno' | 'corepack' | 'opensearch' | 'dynamodb' | 'junit' | 'nix' | 'talos'
  /** Override repo for version fetch (e.g. when main url differs from version source) */
  versionRepo?: { owner: string; repo: string }
  /** URL to version/release info when not from GitHub (e.g. endoflife.date, php.watch) */
  versionUrl?: string
}
