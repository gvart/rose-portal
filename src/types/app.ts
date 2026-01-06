export interface AppConfig {
  id: string
  name: string
  icon: string
  description: string
  route: string
  component: () => Promise<any>
  color: string
  enabled: boolean
  order: number
}
