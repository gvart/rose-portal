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
  @apply max-w-4xl mx-auto mt-8;
}

.results-header {
  @apply flex justify-between items-center mb-6;
}

.results-title {
  @apply text-2xl font-bold text-gray-800;
}

.new-search-button {
  @apply px-6 py-2 text-emerald-600 font-semibold rounded-lg
         border-2 border-emerald-600 hover:bg-emerald-50
         transition-all duration-200;
  min-height: 44px;
}

.results-grid {
  @apply grid grid-cols-2 gap-4;
}

.no-results {
  @apply flex flex-col items-center gap-4 p-12 bg-white rounded-xl;
}

.no-results-text {
  @apply text-lg text-gray-600;
}

.retry-button {
  @apply px-6 py-3 text-white bg-emerald-600 font-semibold rounded-lg
         hover:bg-emerald-700 transition-all duration-200;
}
</style>
