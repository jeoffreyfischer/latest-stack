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
}
