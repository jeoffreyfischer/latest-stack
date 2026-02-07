export type StackCategory =
  | 'language'
  | 'frontend'
  | 'backend'
  | 'devops'
  | 'mobile'
  | 'tooling'

export interface Stack {
  id: string
  name: string
  category: StackCategory
  logo: string
  latestVersion: string
  url: string
  isFavorite: boolean
}
