<template>
  <AppLayout title="Recipe Finder" theme-color="#10b981">
    <div class="recipe-app">
      <!-- Entry Screen -->
      <RecipeEntryScreen
        v-if="currentView === 'entry'"
        @select-recommendations="goToRecommendationsInput"
        @select-recipe="goToRecipeForm"
        @select-meal-prep="goToMealPrep"
        @select-saved-plans="goToSavedPlans"
      />

      <!-- Recommendations Input -->
      <RecommendationsInput
        v-if="currentView === 'recommendations-input'"
        @submit="handleRecommendationsSubmit"
      />

      <!-- Loading Recommendations -->
      <LoadingSpinner
        v-if="currentView === 'recommendations-loading'"
        message="Finding recommendations for you..."
      />

      <!-- Recommendations Results -->
      <RecommendationsResults
        v-if="currentView === 'recommendations-results' && recommendations"
        :recommendations="recommendations"
        @select-dish="handleDishSelect"
        @new-search="goToEntry"
      />

      <!-- Recipe Form -->
      <RecipeForm
        v-if="currentView === 'recipe-form'"
        @submit="handleRecipeSubmit"
      />

      <!-- Loading Recipe -->
      <LoadingSpinner
        v-if="currentView === 'recipe-loading'"
        :message="loadingMessage"
      />

      <!-- Recipe Result -->
      <RecipeResult
        v-if="currentView === 'recipe-result' && recipeResult"
        :result="recipeResult"
        @search-again="goToEntry"
      />

      <!-- Meal Prep Plan -->
      <MealPrepApp
        v-if="currentView === 'meal-prep'"
        @back="goToEntry"
      />

      <!-- Saved Plans -->
      <SavedPlansView
        v-if="currentView === 'saved-plans'"
        @back="goToEntry"
      />

      <!-- Error Message -->
      <ErrorMessage
        v-if="error"
        :message="error"
        @retry="handleRetry"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import RecipeEntryScreen from './components/RecipeEntryScreen.vue'
import RecommendationsInput from './components/RecommendationsInput.vue'
import RecommendationsResults from './components/RecommendationsResults.vue'
import RecipeForm from './components/RecipeForm.vue'
import RecipeResult from './components/RecipeResult.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import MealPrepApp from './meal-prep/MealPrepApp.vue'
import SavedPlansView from './meal-prep/components/SavedPlansView.vue'
import { getRecipe, getRecommendations } from './services/recipeApi'
import type { RecipeResponse, Recommendation } from './types'

type ViewState = 'entry' | 'recommendations-input' | 'recommendations-loading' | 'recommendations-results' | 'recipe-form' | 'recipe-loading' | 'recipe-result' | 'meal-prep' | 'saved-plans'

// State
const currentView = ref<ViewState>('entry')
const recommendations = ref<Recommendation[] | null>(null)
const selectedDish = ref<Recommendation | null>(null)
const recipeResult = ref<RecipeResponse | null>(null)
const error = ref<string | null>(null)
const lastRecommendationRequest = ref<string | null>(null)
const lastRecipeRequest = ref<{ dish: string; question: string } | null>(null)

// Computed
const loadingMessage = computed(() => {
  if (selectedDish.value) {
    return `Fetching recipe for ${selectedDish.value.dishName}...`
  }
  return 'Finding recipe and ingredients...'
})

// Navigation functions
function goToEntry() {
  currentView.value = 'entry'
  resetState()
}

function goToRecommendationsInput() {
  currentView.value = 'recommendations-input'
  error.value = null
}

function goToRecipeForm() {
  currentView.value = 'recipe-form'
  error.value = null
}

function goToMealPrep() {
  currentView.value = 'meal-prep'
  error.value = null
}

function goToSavedPlans() {
  currentView.value = 'saved-plans'
  error.value = null
}

function resetState() {
  recommendations.value = null
  selectedDish.value = null
  recipeResult.value = null
  error.value = null
}

// Recommendations flow
async function handleRecommendationsSubmit(description: string) {
  currentView.value = 'recommendations-loading'
  error.value = null
  lastRecommendationRequest.value = description

  try {
    const results = await getRecommendations(description)
    recommendations.value = results
    currentView.value = 'recommendations-results'
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to get recommendations'
    currentView.value = 'recommendations-input'
  }
}

async function handleDishSelect(dish: Recommendation) {
  selectedDish.value = dish
  currentView.value = 'recipe-loading'
  error.value = null

  const defaultQuestion = 'What are the ingredients and how do I make this?'
  lastRecipeRequest.value = { dish: dish.dishName, question: defaultQuestion }

  try {
    recipeResult.value = await getRecipe(dish.dishName, defaultQuestion)
    currentView.value = 'recipe-result'
  } catch (e) {
    error.value = e instanceof Error ? e.message : `Failed to fetch recipe for ${dish.dishName}`
    currentView.value = 'recommendations-results'
  }
}

// Recipe form flow
async function handleRecipeSubmit(dish: string, question: string) {
  currentView.value = 'recipe-loading'
  error.value = null
  selectedDish.value = null
  lastRecipeRequest.value = { dish, question }

  try {
    recipeResult.value = await getRecipe(dish, question)
    currentView.value = 'recipe-result'
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch recipe'
    currentView.value = 'recipe-form'
  }
}

// Error handling
function handleRetry() {
  if (lastRecommendationRequest.value && (currentView.value === 'recommendations-input' || currentView.value === 'recommendations-results')) {
    handleRecommendationsSubmit(lastRecommendationRequest.value)
  } else if (lastRecipeRequest.value) {
    handleRecipeSubmit(lastRecipeRequest.value.dish, lastRecipeRequest.value.question)
  }
}
</script>

<style scoped>
.recipe-app {
  @apply w-full relative;
}
</style>
