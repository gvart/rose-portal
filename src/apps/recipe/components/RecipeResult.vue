<template>
  <div class="result-container">
    <div class="result-card">
      <div class="recipe-header">
        <h1 class="dish-name">{{ result.dishName }}</h1>
        <div class="prep-time-badge">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="clock-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ result.preparationTime }} min</span>
        </div>
      </div>

      <section class="result-section">
        <h2 class="section-title">Recipe Instructions</h2>
        <div class="recipe-answer markdown-content" v-html="formattedRecipe"></div>
      </section>

      <section class="result-section" v-if="result.ingredients.length > 0">
        <h2 class="section-title">Ingredients</h2>
        <IngredientsList :ingredients="result.ingredients" />
      </section>

      <div class="result-actions">
        <button @click="$emit('searchAgain')" class="action-button primary">
          New Search
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import IngredientsList from './IngredientsList.vue'
import type { RecipeResponse } from '../types'

const props = defineProps<{
  result: RecipeResponse
}>()

defineEmits<{
  searchAgain: []
}>()

const formattedRecipe = computed(() => {
  return marked.parse(props.result.recipe, {
    breaks: true,
    gfm: true
  })
})
</script>

<style scoped>
.result-container {
  @apply max-w-4xl mx-auto mt-8;
}

.result-card {
  @apply bg-white rounded-2xl shadow-xl p-8 space-y-8;
}

.recipe-header {
  @apply flex items-center justify-between gap-4 pb-6 border-b-2 border-emerald-500;
}

.dish-name {
  @apply text-3xl font-bold text-gray-800;
}

.prep-time-badge {
  @apply flex items-center gap-2 px-4 py-2 bg-emerald-100
         text-emerald-700 rounded-lg font-semibold whitespace-nowrap;
}

.clock-icon {
  @apply w-5 h-5;
}

.result-section {
  @apply border-b border-gray-200 pb-6 last:border-b-0;
}

.section-title {
  @apply text-2xl font-bold text-gray-800 mb-4;
}

.recipe-answer {
  @apply text-lg text-gray-700 leading-relaxed;
}

.markdown-content :deep(h1) {
  @apply text-2xl font-bold text-gray-800 mt-6 mb-4;
}

.markdown-content :deep(h2) {
  @apply text-xl font-bold text-gray-800 mt-5 mb-3;
}

.markdown-content :deep(h3) {
  @apply text-lg font-bold text-gray-800 mt-4 mb-2;
}

.markdown-content :deep(p) {
  @apply mb-4;
}

.markdown-content :deep(ul) {
  @apply list-disc list-inside mb-4 space-y-2;
}

.markdown-content :deep(ol) {
  @apply list-decimal list-inside mb-4 space-y-2;
}

.markdown-content :deep(li) {
  @apply text-gray-700 leading-relaxed;
}

.markdown-content :deep(strong) {
  @apply font-bold text-gray-900;
}

.markdown-content :deep(em) {
  @apply italic;
}

.markdown-content :deep(code) {
  @apply bg-gray-100 px-2 py-1 rounded text-sm font-mono text-emerald-700;
}

.markdown-content :deep(pre) {
  @apply bg-gray-100 p-4 rounded-lg mb-4 overflow-x-auto;
}

.markdown-content :deep(pre code) {
  @apply bg-transparent p-0;
}

.markdown-content :deep(blockquote) {
  @apply border-l-4 border-emerald-500 pl-4 italic text-gray-600 mb-4;
}

.markdown-content :deep(a) {
  @apply text-emerald-600 hover:text-emerald-700 underline;
}

.markdown-content :deep(hr) {
  @apply my-6 border-gray-300;
}

.result-actions {
  @apply flex gap-4 pt-4;
}

.action-button {
  @apply flex-1 py-4 px-6 text-lg font-semibold rounded-lg
         transition-all duration-200 shadow-md hover:shadow-lg;
}

.action-button.primary {
  @apply bg-emerald-600 text-white hover:bg-emerald-700;
}
</style>
