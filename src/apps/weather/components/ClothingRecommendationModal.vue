<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)" maximized>
    <q-card class="clothing-recommendation-card">
      <q-card-section class="modal-header">
        <div class="text-h5">What to Wear</div>
        <q-btn icon="close" flat round dense @click="close" />
      </q-card-section>

      <q-card-section class="modal-content">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <q-spinner color="info" size="48px" />
          <p class="loading-text">Getting recommendations...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <q-icon name="error_outline" size="48px" color="negative" />
          <p class="error-title">Unable to Load Recommendations</p>
          <p class="error-message">{{ error }}</p>
          <q-btn
            unelevated
            color="info"
            @click="$emit('retry')"
            class="q-mt-lg"
          >
            <q-icon name="refresh" size="20px" class="q-mr-sm" />
            <span>Try Again</span>
          </q-btn>
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
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
</script>

<style scoped>
.clothing-recommendation-card {
  max-width: 1280px;
  width: 100%;
  height: 100%;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-content {
  overflow-y: auto;
  flex: 1;
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

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) 0;
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
</style>
