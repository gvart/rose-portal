<template>
  <div class="recommendations-results">
    <div class="results-header">
      <h2 class="results-title">Recommended for you</h2>
      <button class="new-search-button" @click="$emit('new-search')">
        New Search
      </button>
    </div>

    <div v-if="recommendations.length > 0" class="results-grid">
      <DishCard
        v-for="dish in recommendations"
        :key="dish.dishName"
        :dish-name="dish.dishName"
        :description="dish.description"
        @click="$emit('select-dish', dish)"
      />
    </div>

    <div v-else class="no-results">
      <p class="no-results-text">No dishes found matching your description.</p>
      <button class="retry-button" @click="$emit('new-search')">
        Try Different Description
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import DishCard from './DishCard.vue'
import type { Recommendation } from '../types'

defineProps<{
  recommendations: Recommendation[]
}>()

defineEmits<{
  selectDish: [dish: Recommendation]
  newSearch: []
}>()
</script>

<style scoped>
.recommendations-results {
  max-width: 64rem;
  margin: 0 auto;
  margin-top: var(--space-8);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.results-title {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.new-search-button {
  padding: var(--space-2) var(--space-6);
  color: var(--color-success-solid);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-success-solid);
  background: transparent;
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 44px;
}

.new-search-button:active {
  background: var(--color-success-bg);
  transform: scale(0.98);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-16);
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-lg);
}

.no-results-text {
  font-size: var(--font-size-18);
  color: var(--color-text-secondary);
}

.retry-button {
  padding: var(--space-3) var(--space-6);
  color: white;
  background: var(--color-success-solid);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 44px;
}

.retry-button:active {
  transform: scale(0.98);
  background: #059669;
}
</style>
