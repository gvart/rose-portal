<template>
  <div class="meal-prep-app">
    <!-- Wizard View -->
      <!-- Step Indicator -->
      <StepIndicator
        :current-step="store.currentStep"
        @go-to-step="handleStepNavigation"
      />

      <!-- Wizard Content -->
      <div class="wizard-container">
      <!-- Step 1: Preferences -->
      <Transition name="fade" mode="out-in">
        <div v-if="store.currentStep === 'preferences'" key="preferences" class="step-content">
          <h2 class="step-title">Set Your Meal Preferences</h2>
          <p class="step-subtitle">Tell us what you'd like to prepare this week</p>

          <MealPreferenceForm
            :user-input="store.userInput"
            :preferences="store.mealPreferences"
            @update:user-input="store.userInput = $event"
            @update:preferences="store.mealPreferences = $event"
            @submit="handleGeneratePlan"
          />
        </div>

        <!-- Step 2: Review Categories -->
        <div v-else-if="store.currentStep === 'review'" key="review" class="step-content">
          <div class="step-header">
            <div>
              <h2 class="step-title">Review & Select Dishes</h2>
              <p class="step-subtitle">
                Selected: {{ store.selectedDishCount }} dish{{ store.selectedDishCount !== 1 ? 'es' : '' }}
              </p>
            </div>
            <button
              @click="handleBuildMenu"
              :disabled="!store.canProceedFromReview || store.loading"
              class="proceed-button"
            >
              Build Menu
            </button>
          </div>

          <div class="categories-list">
            <CategoryReview
              v-for="category in store.categories"
              :key="category.id"
              :category="category"
              :selected-dishes="store.selectedDishes"
              :is-refreshing="refreshingCategoryId === category.id"
              @refresh="handleRefreshCategory(category.id)"
              @toggle-dish="store.toggleDishSelection($event)"
            />
          </div>
        </div>

        <!-- Step 3: Weekly Menu & Grocery List -->
        <div v-else-if="store.currentStep === 'menu'" key="menu" class="step-content">
          <div class="step-header">
            <h2 class="step-title">Your Weekly Meal Plan</h2>
            <button @click="handleNewPlan" class="new-plan-button">
              Start New Plan
            </button>
          </div>

          <!-- Tabs -->
          <div class="tabs-container">
            <button
              @click="activeTab = 'menu'"
              :class="['tab-button', { active: activeTab === 'menu' }]"
            >
              Weekly Menu
            </button>
            <button
              @click="activeTab = 'grocery'"
              :class="['tab-button', { active: activeTab === 'grocery' }]"
            >
              Grocery List
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <WeeklyMenuView
              v-if="activeTab === 'menu'"
              :weekly-menu="store.weeklyMenu"
            />
            <GroceryListView
              v-else
              :grocery-list="store.groceryList"
            />
          </div>
        </div>
      </Transition>
      </div>

    <!-- Loading Overlay -->
    <Transition name="fade">
      <div v-if="store.loading" class="loading-overlay">
        <div class="loading-card">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="loading-spinner">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="loading-text">{{ loadingMessage }}</p>
        </div>
      </div>
    </Transition>

    <!-- Error Message -->
    <Transition name="fade">
      <div v-if="store.error" class="error-banner">
        <div class="error-content">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="error-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span class="error-text">{{ store.error }}</span>
        </div>
        <button @click="store.error = null" class="error-close">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="close-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMealPrepStore } from './stores/mealPrepStore'
import StepIndicator from './components/StepIndicator.vue'
import MealPreferenceForm from './components/MealPreferenceForm.vue'
import CategoryReview from './components/CategoryReview.vue'
import WeeklyMenuView from './components/WeeklyMenuView.vue'
import GroceryListView from './components/GroceryListView.vue'

defineEmits<{
  back: []
}>()

const store = useMealPrepStore()
const activeTab = ref<'menu' | 'grocery'>('menu')
const refreshingCategoryId = ref<string | null>(null)

const loadingMessage = computed(() => {
  if (store.currentStep === 'preferences') {
    return 'Generating meal plan...'
  } else if (store.currentStep === 'review') {
    return 'Building your weekly menu...'
  }
  return 'Loading...'
})

function handleStepNavigation(step: 'preferences' | 'review' | 'menu') {
  // Only allow navigation to completed steps
  const currentIndex = ['preferences', 'review', 'menu'].indexOf(store.currentStep)
  const targetIndex = ['preferences', 'review', 'menu'].indexOf(step)

  if (targetIndex <= currentIndex) {
    store.goToStep(step)
  }
}

async function handleGeneratePlan() {
  const success = await store.generatePlan()
  if (!success) {
    // Error message is already set in the store
    console.error('Failed to generate plan')
  }
}

async function handleRefreshCategory(categoryId: string) {
  refreshingCategoryId.value = categoryId
  await store.refreshCategory(categoryId)
  refreshingCategoryId.value = null
}

async function handleBuildMenu() {
  const success = await store.buildWeeklyMenu()
  if (success) {
    activeTab.value = 'menu'
  }
}

function handleNewPlan() {
  store.reset()
}
</script>

<style scoped>
.meal-prep-app {
  width: 100%;
  position: relative;
}

.wizard-container {
  max-width: 64rem;
  margin: 0 auto;
  margin-top: var(--space-6);
}

.step-content {
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
}

.step-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-6);
  gap: var(--space-4);
}

.step-title {
  font-size: var(--font-size-32);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.step-subtitle {
  font-size: var(--font-size-18);
  color: var(--color-text-secondary);
  margin-top: var(--space-2);
}

.proceed-button {
  padding: var(--space-3) var(--space-6);
  background: var(--color-success-solid);
  color: white;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  white-space: nowrap;
  min-height: 48px;
}

.proceed-button:active:not(:disabled) {
  transform: scale(0.98);
  background: #059669;
}

.proceed-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.new-plan-button {
  padding: var(--space-3) var(--space-6);
  background: var(--color-text-secondary);
  color: white;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  white-space: nowrap;
  min-height: 48px;
}

.new-plan-button:active {
  transform: scale(0.98);
  background: var(--color-text-primary);
}

.tabs-container {
  display: flex;
  gap: var(--space-2);
  border-bottom: 2px solid var(--color-border-primary);
  margin-bottom: var(--space-6);
}

.tab-button {
  padding: var(--space-3) var(--space-6);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  border-bottom: 2px solid transparent;
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 52px;
}

.tab-button:active:not(.active) {
  color: var(--color-success-solid);
}

.tab-button.active {
  color: var(--color-success-solid);
  border-bottom-color: var(--color-success-solid);
}

.tab-content {
  min-height: 400px;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.loading-card {
  background: var(--color-bg-primary);
  border: var(--depth-3-border);
  box-shadow: var(--depth-3-shadow);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  align-items: center;
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

.error-banner {
  position: fixed;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-error-bg);
  border: 2px solid var(--color-error-solid);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  box-shadow: var(--depth-4-shadow);
  max-width: 48rem;
  z-index: 40;
}

.error-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.error-icon {
  width: 24px;
  height: 24px;
  color: var(--color-error-solid);
  flex-shrink: 0;
}

.error-text {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-medium);
  color: var(--color-error-text);
}

.error-close {
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 40px;
  min-width: 40px;
}

.error-close:active {
  background: var(--color-error-border);
}

.close-icon {
  width: 20px;
  height: 20px;
  color: var(--color-error-solid);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
