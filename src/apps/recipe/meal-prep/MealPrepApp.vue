<template>
  <div class="meal-prep-app">
    <!-- View Toggle -->
    <div class="view-toggle">
      <button
        @click="currentView = 'wizard'"
        :class="['view-button', { active: currentView === 'wizard' }]"
      >
        Create New Plan
      </button>
      <button
        @click="currentView = 'saved'"
        :class="['view-button', { active: currentView === 'saved' }]"
      >
        Saved Plans
      </button>
    </div>

    <!-- Saved Plans View -->
    <div v-if="currentView === 'saved'" class="saved-view-container">
      <SavedPlansView />
    </div>

    <!-- Wizard View -->
    <div v-else>
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
import SavedPlansView from './components/SavedPlansView.vue'

const emit = defineEmits<{
  back: []
}>()

const store = useMealPrepStore()
const currentView = ref<'wizard' | 'saved'>('wizard')
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

function handleBack() {
  store.reset()
  emit('back')
}

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
  @apply w-full relative;
}

.view-toggle {
  @apply flex gap-4 mb-6 border-b-2 border-gray-200 pb-2;
}

.view-button {
  @apply px-6 py-3 font-bold text-gray-600
         border-b-4 border-transparent transition-all duration-200
         hover:text-emerald-600 hover:border-emerald-300;
  min-height: 52px;
}

.view-button.active {
  @apply text-emerald-600 border-emerald-600;
}

.saved-view-container {
  @apply max-w-6xl mx-auto mt-6;
}

.wizard-container {
  @apply max-w-4xl mx-auto mt-6;
}

.step-content {
  @apply bg-white rounded-2xl shadow-xl p-8;
}

.step-header {
  @apply flex items-start justify-between mb-6 gap-4;
}

.step-title {
  @apply text-3xl font-bold text-gray-800;
}

.step-subtitle {
  @apply text-lg text-gray-600 mt-2;
}

.proceed-button {
  @apply px-6 py-3 bg-emerald-600 text-white font-bold
         rounded-lg hover:bg-emerald-700 transition-all duration-200
         disabled:opacity-50 disabled:cursor-not-allowed
         disabled:hover:bg-emerald-600 whitespace-nowrap;
  min-height: 48px;
}

.categories-list {
  @apply flex flex-col gap-6;
}

.new-plan-button {
  @apply px-6 py-3 bg-gray-600 text-white font-bold
         rounded-lg hover:bg-gray-700 transition-all duration-200
         whitespace-nowrap;
  min-height: 48px;
}

.tabs-container {
  @apply flex gap-2 border-b-2 border-gray-200 mb-6;
}

.tab-button {
  @apply px-6 py-3 font-semibold text-gray-600
         border-b-2 border-transparent transition-all duration-200
         hover:text-emerald-600;
  min-height: 52px;
}

.tab-button.active {
  @apply text-emerald-600 border-emerald-600;
}

.tab-content {
  @apply min-h-[400px];
}

.loading-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center
         justify-center z-50;
}

.loading-card {
  @apply bg-white rounded-2xl p-8 flex flex-col items-center gap-4;
}

.loading-spinner {
  @apply w-12 h-12 text-emerald-600 animate-spin;
}

.loading-text {
  @apply text-lg font-semibold text-gray-800;
}

.error-banner {
  @apply fixed bottom-6 left-1/2 transform -translate-x-1/2
         bg-red-100 border-2 border-red-500 rounded-lg p-4
         flex items-center gap-4 shadow-xl max-w-2xl z-40;
}

.error-content {
  @apply flex items-center gap-3;
}

.error-icon {
  @apply w-6 h-6 text-red-600 flex-shrink-0;
}

.error-text {
  @apply text-base font-medium text-red-800;
}

.error-close {
  @apply p-2 hover:bg-red-200 rounded-lg transition-all duration-200;
  min-height: 40px;
  min-width: 40px;
}

.close-icon {
  @apply w-5 h-5 text-red-600;
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
