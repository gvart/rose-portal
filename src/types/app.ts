export interface AppConfig {
  id: string
  name: string
  iconName?: string // Material Symbols icon name (e.g., 'restaurant', 'settings')
  description: string
  route: string
  component: () => Promise<any>
  color: string
  enabled: boolean
  order: number
}
