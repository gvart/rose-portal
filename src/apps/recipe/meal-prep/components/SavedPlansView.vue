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
  width: 100%;
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 2px solid var(--color-border-primary);
}

.header-title {
  font-size: var(--font-size-32);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.plan-count {
  padding: var(--space-2) var(--space-4);
  background: var(--color-success-solid);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  gap: var(--space-4);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  color: var(--color-success-solid);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  background: var(--color-error-bg);
  border: 2px solid var(--color-error-border);
  border-radius: var(--radius-lg);
  gap: var(--space-4);
}

.error-message {
  font-size: var(--font-size-18);
  color: var(--color-error-text);
  font-weight: var(--font-weight-medium);
}

.retry-button {
  padding: var(--space-3) var(--space-6);
  background: var(--color-error-solid);
  color: white;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 48px;
}

.retry-button:active {
  transform: scale(0.98);
  background: #dc2626;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

.empty-message {
  font-size: var(--font-size-18);
  color: var(--color-text-secondary);
}

.plans-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.plan-card {
  background: var(--color-bg-primary);
  border: 2px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.plan-card:active {
  border-color: var(--color-success-border);
  box-shadow: var(--depth-2-shadow);
}

.plan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  min-height: 80px;
}

.plan-info {
  flex: 1;
}

.plan-title {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.plan-meta {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
}

.arrow-icon {
  width: 24px;
  height: 24px;
  color: var(--color-success-solid);
  transition: transform var(--duration-fast) var(--ease-in-out);
  min-width: 24px;
  min-height: 24px;
}

.plan-card:active .arrow-icon {
  transform: translateX(4px);
}
</style>
