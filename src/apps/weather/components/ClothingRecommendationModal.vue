<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="close">
        <div class="modal-container" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">What to Wear</h2>
            <button class="close-btn" @click="close" v-haptic>
              <Icon icon="mdi:close" :width="24" :height="24" />
            </button>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <Icon icon="mdi:loading" class="spin" :width="48" :height="48" />
              <p class="loading-text">Getting recommendations...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-state">
              <Icon icon="mdi:alert-circle-outline" :width="48" :height="48" class="error-icon" />
              <p class="error-title">Unable to Load Recommendations</p>
              <p class="error-message">{{ error }}</p>
              <button class="retry-btn" @click="$emit('retry')" v-haptic>
                <Icon icon="mdi:refresh" :width="20" :height="20" />
                <span>Try Again</span>
              </button>
            </div>

            <!-- Recommendations -->
            <div v-else-if="recommendations" class="recommendations">
              <!-- Weather Summary -->
              <div class="weather-summary">
                <p class="summary-description">{{ recommendations.description }}</p>
                <div class="summary-metrics">
                  <div class="metric">
                    <span class="metric-label">Temp</span>
                    <span class="metric-value"
                      >{{ Math.round(recommendations.weatherSummary.temperature) }}°</span
                    >
                  </div>
                  <div class="metric">
                    <span class="metric-label">Feels Like</span>
                    <span class="metric-value"
                      >{{ Math.round(recommendations.weatherSummary.apparentTemperature) }}°</span
                    >
                  </div>
                  <div class="metric">
                    <span class="metric-label">Wind</span>
                    <span class="metric-value"
                      >{{ Math.round(recommendations.weatherSummary.windSpeed) }} km/h</span
                    >
                  </div>
                </div>
              </div>

              <!-- Body Part Sections Grid -->
              <div class="sections-grid">
                <div
                  v-for="bodyPart in visibleBodyParts"
                  :key="bodyPart"
                  class="body-part-section"
                >
                  <h3 class="section-title">{{ getBodyPartLabel(bodyPart) }}</h3>
                  <div class="clothing-grid">
                    <div
                      v-for="item in recommendations.recommendations[bodyPart]"
                      :key="item"
                      class="clothing-item"
                    >
                      <ClothingIcon :item="item" :size="20" class="item-icon" />
                      <span class="item-label">{{ getClothingItemLabel(item) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No recommendations message -->
              <div v-if="visibleBodyParts.length === 0" class="no-recommendations">
                <p>No recommendations available for your area</p>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state">
              <p>No recommendations available</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import ClothingIcon from './ClothingIcon.vue'
import type { ClothingRecommendationResponse } from '../types/clothing'
import { BodyPart, getBodyPartLabel, CLOTHING_ICONS } from '../types/clothing'

const props = defineProps<{
  modelValue: boolean
  recommendations: ClothingRecommendationResponse | null
  loading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  retry: []
}>()

// Get visible body parts (those with at least one recommendation)
const visibleBodyParts = computed(() => {
  if (!props.recommendations) return []

  return Object.values(BodyPart).filter((bodyPart) => {
    const items = props.recommendations!.recommendations[bodyPart]
    return items && items.length > 0
  })
})

function getClothingItemLabel(item: string): string {
  return CLOTHING_ICONS[item as keyof typeof CLOTHING_ICONS]?.label || item
}

function close() {
  emit('update:modelValue', false)
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.modelValue) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  @apply fixed inset-0 flex items-center justify-center;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  padding: 0.5rem;
}

@media (min-width: 640px) {
  .modal-overlay {
    padding: 1rem;
  }
}

/* Modal Container */
.modal-container {
  @apply w-full rounded-2xl shadow-2xl flex flex-col;
  max-width: 95vw;
  max-height: 95vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(40px);
}

@media (min-width: 768px) {
  .modal-container {
    max-width: 90vw;
  }
}

@media (min-width: 1024px) {
  .modal-container {
    max-width: 80vw;
  }
}

@media (min-width: 1280px) {
  .modal-container {
    max-width: 1280px;
  }
}

/* Modal Header */
.modal-header {
  @apply flex items-center justify-between border-b border-gray-200;
  background: rgba(255, 255, 255, 0.98);
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  padding: 0.75rem 1rem;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .modal-header {
    padding: 1rem 1.5rem;
  }
}

.modal-title {
  @apply text-lg font-semibold text-gray-900;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

@media (min-width: 640px) {
  .modal-title {
    @apply text-xl;
  }
}

.close-btn {
  @apply p-1.5 rounded-lg transition-colors;
  color: #6b7280;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .close-btn {
    @apply p-2;
  }
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

/* Modal Content */
.modal-content {
  @apply overflow-y-auto;
  flex: 1;
  min-height: 0;
  padding: 0.75rem 1rem;
}

@media (min-width: 640px) {
  .modal-content {
    padding: 1rem 1.5rem;
  }
}

/* Loading State */
.loading-state {
  @apply flex flex-col items-center justify-center py-12;
}

.loading-text {
  @apply mt-4 text-gray-600 font-medium;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

.spin {
  animation: spin 1s linear infinite;
  color: #3b82f6;
}

/* Error State */
.error-state {
  @apply flex flex-col items-center justify-center py-12;
}

.error-icon {
  color: #ef4444;
}

.error-title {
  @apply mt-4 text-lg font-semibold text-gray-900;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

.error-message {
  @apply mt-2 text-sm text-gray-600 text-center;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

.retry-btn {
  @apply mt-6 flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg;
  @apply transition-all duration-150 active:scale-95;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

.retry-btn:hover {
  background: #2563eb;
}

/* Weather Summary */
.weather-summary {
  @apply rounded-xl;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 0.75rem;
  margin-bottom: 1rem;
}

@media (min-width: 640px) {
  .weather-summary {
    padding: 1rem;
    margin-bottom: 1.25rem;
  }
}

.summary-description {
  @apply text-xs font-medium text-gray-800 text-center;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  margin-bottom: 0.5rem;
}

@media (min-width: 640px) {
  .summary-description {
    @apply text-sm;
    margin-bottom: 0.75rem;
  }
}

.summary-metrics {
  @apply flex gap-3 justify-center;
}

@media (min-width: 640px) {
  .summary-metrics {
    @apply gap-6;
  }
}

.metric {
  @apply flex flex-col items-center;
}

.metric-label {
  @apply text-xs text-gray-600;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  margin-bottom: 0.125rem;
}

.metric-value {
  @apply text-sm font-semibold text-gray-900;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

/* Sections Grid - Multi-column layout */
.sections-grid {
  @apply grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .sections-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (min-width: 1024px) {
  .sections-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
}

/* Body Part Sections */
.body-part-section {
  @apply rounded-xl;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0.75rem;
}

@media (min-width: 640px) {
  .body-part-section {
    padding: 1rem;
  }
}

.section-title {
  @apply text-sm font-semibold text-gray-900;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  margin-bottom: 0.5rem;
}

@media (min-width: 640px) {
  .section-title {
    @apply text-base;
    margin-bottom: 0.75rem;
  }
}

.clothing-grid {
  @apply flex flex-col;
  gap: 0.375rem;
}

@media (min-width: 640px) {
  .clothing-grid {
    gap: 0.5rem;
  }
}

.clothing-item {
  @apply flex items-center rounded-lg;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  padding: 0.5rem;
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .clothing-item {
    padding: 0.625rem;
    gap: 0.75rem;
  }
}

.clothing-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.item-label {
  @apply text-xs font-medium text-gray-700 flex-1;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

@media (min-width: 640px) {
  .item-label {
    @apply text-sm;
  }
}

.item-icon {
  flex-shrink: 0;
}

/* Empty State */
.empty-state,
.no-recommendations {
  @apply flex items-center justify-center py-12 text-gray-600;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  @apply transition-all duration-300 ease-out;
}

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  @apply scale-95;
  transform: translateY(1rem) scale(0.95);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
