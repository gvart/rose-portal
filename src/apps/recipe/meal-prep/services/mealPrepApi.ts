import axios from 'axios'
import type {
  CreatePlanRequest,
  CreatePlanResponse,
  RefreshCategoryResponse,
  WeeklyMenuResponse
} from '../types'

const api = axios.create({
  baseURL: '/api/v1/meal-prep',
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Create a new meal prep plan with user preferences
 */
export async function createPlan(request: CreatePlanRequest): Promise<CreatePlanResponse> {
  const response = await api.post<CreatePlanResponse>('/plan', request)
  return response.data
}

/**
 * Refresh recommendations for a specific category
 */
export async function refreshCategory(
  planId: string,
  categoryId: string
): Promise<RefreshCategoryResponse> {
  const response = await api.get<RefreshCategoryResponse>(
    `/plan/${planId}/${categoryId}/refresh`
  )
  return response.data
}

/**
 * Build weekly menu from selected dishes
 */
export async function buildMenu(
  planId: string,
  dishIdList: string[]
): Promise<WeeklyMenuResponse> {
  const response = await api.post<WeeklyMenuResponse>(`/plan/${planId}/build`, {
    dishIdList
  })
  return response.data
}

/**
 * Get all saved meal prep plans
 */
export async function getAllPlans(): Promise<WeeklyMenuResponse[]> {
  const response = await api.get<WeeklyMenuResponse[]>('/plan')
  return response.data
}
