export interface NavigationItem {
  id: string
  label: string
  icon: any
  path?: string
  badge?: number
  children?: NavigationItem[]
  roles?: string[]
  permissions?: string[]
}