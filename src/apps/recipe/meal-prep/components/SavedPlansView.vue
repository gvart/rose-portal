<template>
  <div class="saved-plans-view">
    <!-- Header -->
    <div class="view-header">
      <h2 class="header-title">Saved Meal Plans</h2>
      <span class="plan-count">{{ plans.length }} plan{{ plans.length !== 1 ? 's' : '' }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="loading-spinner">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="loading-text">Loading saved plans...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="loadPlans" class="retry-button">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="plans.length === 0" class="empty-state">
      <p class="empty-message">No saved meal plans yet. Create your first plan to get started!</p>
    </div>

    <!-- Plans List -->
    <div v-else class="plans-container">
      <div
        v-for="(plan, index) in plans"
        :key="index"
        class="plan-card"
        @click="openPlanModal(plan, index)"
      >
        <div class="plan-header">
          <div class="plan-info">
            <h3 class="plan-title">Meal Plan #{{ index + 1 }}</h3>
            <p class="plan-meta">
              {{ plan.dishList.length }} dish{{ plan.dishList.length !== 1 ? 'es' : '' }} •
              {{ plan.groceryList.length }} ingredient{{ plan.groceryList.length !== 1 ? 's' : '' }}
            </p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="arrow-icon"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <MealPlanModal
      v-if="selectedPlan"
      v-model="showModal"
      :plan="selectedPlan"
      :plan-index="selectedPlanIndex"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllPlans } from '../services/mealPrepApi'
import type { WeeklyMenuResponse } from '../types'
import MealPlanModal from './MealPlanModal.vue'

const plans = ref<WeeklyMenuResponse[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showModal = ref(false)
const selectedPlan = ref<WeeklyMenuResponse | null>(null)
const selectedPlanIndex = ref(0)

onMounted(() => {
  loadPlans()
})

async function loadPlans() {
  loading.value = true
  error.value = null

  try {
    plans.value = await getAllPlans()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load saved plans'
  } finally {
    loading.value = false
  }
}

function openPlanModal(plan: WeeklyMenuResponse, index: number) {
  selectedPlan.value = plan
  selectedPlanIndex.value = index
  showModal.value = true
}
</script>

<style scoped>
.saved-plans-view {
  @apply w-full;
}

.view-header {
  @apply flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200;
}

.header-title {
  @apply text-3xl font-bold text-gray-800;
}

.plan-count {
  @apply px-4 py-2 bg-emerald-600 text-white
         rounded-full text-sm font-semibold;
}

.loading-state {
  @apply flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl gap-4;
}

.loading-spinner {
  @apply w-12 h-12 text-emerald-600 animate-spin;
}

.loading-text {
  @apply text-lg font-semibold text-gray-800;
}

.error-state {
  @apply flex flex-col items-center justify-center p-12 bg-red-50
         border-2 border-red-200 rounded-xl gap-4;
}

.error-message {
  @apply text-lg text-red-700 font-medium;
}

.retry-button {
  @apply px-6 py-3 bg-red-600 text-white font-bold
         rounded-lg hover:bg-red-700 transition-all duration-200;
  min-height: 48px;
}

.empty-state {
  @apply flex items-center justify-center p-12 bg-gray-50 rounded-xl;
}

.empty-message {
  @apply text-lg text-gray-600;
}

.plans-container {
  @apply flex flex-col gap-4;
}

.plan-card {
  @apply bg-white rounded-xl border-2 border-gray-200
         hover:border-emerald-300 hover:shadow-lg
         transition-all duration-200 cursor-pointer;
}

.plan-header {
  @apply flex items-center justify-between p-6;
  min-height: 80px;
}

.plan-info {
  @apply flex-1;
}

.plan-title {
  @apply text-xl font-bold text-gray-800 mb-1;
}

.plan-meta {
  @apply text-sm text-gray-600;
}

.arrow-icon {
  @apply w-6 h-6 text-emerald-600 transition-transform duration-200;
  min-width: 24px;
  min-height: 24px;
}

.plan-card:hover .arrow-icon {
  @apply translate-x-1;
}
</style>
