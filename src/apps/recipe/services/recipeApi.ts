import type { RecipeRequest, RecipeResponse, RecommendationsRequest, Recommendation } from '../types'
import { apiClients } from '@/services/apiClient'

const api = apiClients.recipe

export async function getRecipe(
  dishName: string,
  question: string
): Promise<RecipeResponse> {
  const request: RecipeRequest = {
    dishName,
    question
  }

  const response = await api.post<RecipeResponse>('/api/v1/recipe', request)
  return response.data
}

export async function getRecommendations(
  description: string
): Promise<Recommendation[]> {
  const request: RecommendationsRequest = {
    description
  }

  const response = await api.post<Recommendation[]>('/api/v1/recipe/recommendations', request)
  return response.data
}
