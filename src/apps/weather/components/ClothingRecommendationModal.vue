<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="close">
        <div class="modal-container" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">What to Wear</h2>
            <button class="close-btn" @click="close">
              <q-icon name="close" size="24px" />
            </button>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <q-icon name="sync" class="spin" size="48px" />
              <p class="loading-text">Getting recommendations...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-state">
              <q-icon name="error_outline" size="48px" class="error-icon" />
              <p class="error-title">Unable to Load Recommendations</p>
              <p class="error-message">{{ error }}</p>
              <button class="retry-btn" @click="$emit('retry')">
                <q-icon name="refresh" size="20px" />
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
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.6);
  padding: var(--space-2);
}

@media (min-width: 640px) {
  .modal-overlay {
    padding: var(--space-4);
  }
}

/* Modal Container */
.modal-container {
  width: 100%;
  border-radius: var(--radius-lg);
  box-shadow: var(--depth-3-shadow);
  display: flex;
  flex-direction: column;
  max-width: 95vw;
  max-height: 95vh;
  background: var(--color-bg-primary);
  border: var(--depth-3-border);
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: var(--depth-1-border);
  background: var(--color-bg-primary);
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .modal-header {
    padding: var(--space-4) var(--space-6);
  }
}

.modal-title {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

@media (min-width: 640px) {
  .modal-title {
    font-size: var(--font-size-24);
  }
}

.close-btn {
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .close-btn {
    padding: var(--space-2);
  }
}

.close-btn:active {
  background: var(--color-bg-active);
  color: var(--color-text-primary);
}

/* Modal Content */
.modal-content {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding: var(--space-3) var(--space-4);
}

@media (min-width: 640px) {
  .modal-content {
    padding: var(--space-4) var(--space-6);
  }
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) 0;
}

.loading-text {
  margin-top: var(--space-4);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

.spin {
  animation: spin 1s linear infinite;
  color: var(--color-info-solid);
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) 0;
}

.error-icon {
  color: var(--color-error-solid);
}

.error-title {
  margin-top: var(--space-4);
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

.error-message {
  margin-top: var(--space-2);
  font-size: var(--font-size-13);
  color: var(--color-text-secondary);
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

.retry-btn {
  margin-top: var(--space-8);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  background: var(--color-info-solid);
  color: white;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

.retry-btn:active {
  transform: scale(0.95);
  background: #2563eb;
}

/* Weather Summary */
.weather-summary {
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: var(--space-3);
  margin-bottom: var(--space-4);
}

@media (min-width: 640px) {
  .weather-summary {
    padding: var(--space-4);
    margin-bottom: var(--space-5);
  }
}

.summary-description {
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  margin-bottom: var(--space-2);
}

@media (min-width: 640px) {
  .summary-description {
    font-size: var(--font-size-13);
    margin-bottom: var(--space-3);
  }
}

.summary-metrics {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

@media (min-width: 640px) {
  .summary-metrics {
    gap: var(--space-6);
  }
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-label {
  font-size: var(--font-size-12);
  color: var(--color-text-secondary);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  margin-bottom: var(--space-1);
}

.metric-value {
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

/* Sections Grid - Multi-column layout */
.sections-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

@media (min-width: 640px) {
  .sections-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }
}

@media (min-width: 1024px) {
  .sections-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-5);
  }
}

/* Body Part Sections */
.body-part-section {
  border-radius: var(--radius-lg);
  background: var(--color-bg-secondary);
  border: var(--depth-1-border);
  padding: var(--space-3);
}

@media (min-width: 640px) {
  .body-part-section {
    padding: var(--space-4);
  }
}

.section-title {
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  margin-bottom: var(--space-2);
}

@media (min-width: 640px) {
  .section-title {
    font-size: var(--font-size-16);
    margin-bottom: var(--space-3);
  }
}

.clothing-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

@media (min-width: 640px) {
  .clothing-grid {
    gap: var(--space-2);
  }
}

.clothing-item {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  transition: all var(--duration-fast) var(--ease-in-out);
  padding: var(--space-2);
  gap: var(--space-2);
}

@media (min-width: 640px) {
  .clothing-item {
    padding: var(--space-3);
    gap: var(--space-3);
  }
}

.clothing-item:active {
  background: var(--color-bg-tertiary);
  transform: scale(0.99);
}

.item-label {
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  flex: 1;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

@media (min-width: 640px) {
  .item-label {
    font-size: var(--font-size-13);
  }
}

.item-icon {
  flex-shrink: 0;
}

/* Empty State */
.empty-state,
.no-recommendations {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) 0;
  color: var(--color-text-secondary);
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
