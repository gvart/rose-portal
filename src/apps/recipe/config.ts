import type { AppConfig } from '@/types/app'

export const recipeAppConfig: AppConfig = {
  id: 'recipe',
  name: 'Recipe Finder',
  description: 'Find recipes and ingredients',
  route: '/recipe',
  component: () => import('./RecipeApp.vue'),
  color: '#10b981',
  enabled: true,
  order: 1
}
