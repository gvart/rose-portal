import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createPlan, refreshCategory as apiRefreshCategory, buildMenu as apiBuildMenu } from '../services/mealPrepApi'
import type {
  MealPreference,
  MealPrepCategory,
  DishDetail,
  Ingredient,
  CreatePlanRequest
} from '../types'

type StepType = 'preferences' | 'review' | 'menu'

export const useMealPrepStore = defineStore('mealPrep', () => {
  // State
  const currentStep = ref<StepType>('preferences')
  const mealPreferences = ref<MealPreference[]>([])
  const userInput = ref<string>('')
  const planId = ref<string | null>(null)
  const categories = ref<MealPrepCategory[]>([])
  const selectedDishes = ref<Set<string>>(new Set()) // Stores dish IDs
  const weeklyMenu = ref<DishDetail[]>([])
  const groceryList = ref<Ingredient[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const selectedDishCount = computed(() => selectedDishes.value.size)
  const hasSelectedDishes = computed(() => selectedDishes.value.size > 0)
  const canProceedFromReview = computed(() => selectedDishes.value.size >= 1)

  // Actions
  async function generatePlan() {
    if (mealPreferences.value.length === 0) {
      error.value = 'At least one meal preference is required'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const request: CreatePlanRequest = {
        userInput: userInput.value || undefined,
        mealPreferences: mealPreferences.value
      }

      const response = await createPlan(request)
      planId.value = response.id
      categories.value = response.response
      currentStep.value = 'review'
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to generate meal plan'
      return false
    } finally {
      loading.value = false
    }
  }

  async function refreshCategory(categoryId: string) {
    if (!planId.value) {
      error.value = 'No active plan'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const refreshedCategory = await apiRefreshCategory(planId.value, categoryId)

      // Update the category in the list
      const index = categories.value.findIndex(cat => cat.id === categoryId)
      if (index !== -1) {
        categories.value[index] = refreshedCategory
      }

      // Remove any selected dishes from this category that are no longer present
      const newDishIds = new Set(refreshedCategory.mealRecommendations.map(r => r.id))
      const dishIdsToRemove = Array.from(selectedDishes.value).filter(dishId => {
        // Check if this dish was from this category and is no longer present
        const wasInCategory = categories.value[index]?.mealRecommendations.some(r => r.id === dishId)
        return wasInCategory && !newDishIds.has(dishId)
      })

      dishIdsToRemove.forEach(dishId => selectedDishes.value.delete(dishId))

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to refresh category'
      return false
    } finally {
      loading.value = false
    }
  }

  function toggleDishSelection(dishId: string) {
    if (selectedDishes.value.has(dishId)) {
      selectedDishes.value.delete(dishId)
    } else {
      selectedDishes.value.add(dishId)
    }
  }

  async function buildWeeklyMenu() {
    if (!planId.value) {
      error.value = 'No active plan'
      return false
    }

    if (selectedDishes.value.size === 0) {
      error.value = 'No dishes selected'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const dishIdList = Array.from(selectedDishes.value)
      const response = await apiBuildMenu(planId.value, dishIdList)

      weeklyMenu.value = response.dishList
      groceryList.value = response.groceryList
      currentStep.value = 'menu'
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to build weekly menu'
      return false
    } finally {
      loading.value = false
    }
  }

  function goToStep(step: StepType) {
    currentStep.value = step
  }

  function reset() {
    currentStep.value = 'preferences'
    mealPreferences.value = []
    userInput.value = ''
    planId.value = null
    categories.value = []
    selectedDishes.value = new Set()
    weeklyMenu.value = []
    groceryList.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    currentStep,
    mealPreferences,
    userInput,
    planId,
    categories,
    selectedDishes,
    weeklyMenu,
    groceryList,
    loading,
    error,

    // Computed
    selectedDishCount,
    hasSelectedDishes,
    canProceedFromReview,

    // Actions
    generatePlan,
    refreshCategory,
    toggleDishSelection,
    buildWeeklyMenu,
    goToStep,
    reset
  }
})
