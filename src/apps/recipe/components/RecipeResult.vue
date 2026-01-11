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
  max-width: 64rem;
  margin: 0 auto;
  margin-top: var(--space-8);
}

.result-card {
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.recipe-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding-bottom: var(--space-6);
  border-bottom: 2px solid var(--color-success-solid);
}

.dish-name {
  font-size: var(--font-size-32);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.prep-time-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-success-bg);
  color: var(--color-success-text);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}

.clock-icon {
  width: 20px;
  height: 20px;
}

.result-section {
  border-bottom: 1px solid var(--color-border-primary);
  padding-bottom: var(--space-6);
}

.result-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
}

.recipe-answer {
  font-size: var(--font-size-18);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.markdown-content :deep(h1) {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-top: var(--space-6);
  margin-bottom: var(--space-4);
}

.markdown-content :deep(h2) {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-top: var(--space-5);
  margin-bottom: var(--space-3);
}

.markdown-content :deep(h3) {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-top: var(--space-4);
  margin-bottom: var(--space-2);
}

.markdown-content :deep(p) {
  margin-bottom: var(--space-4);
}

.markdown-content :deep(ul), .markdown-content :deep(ol) {
  list-style-position: inside;
  margin-bottom: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.markdown-content :deep(ul) {
  list-style-type: disc;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
}

.markdown-content :deep(li) {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.markdown-content :deep(strong) {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(code) {
  background: var(--color-bg-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-xs);
  font-size: var(--font-size-13);
  font-family: var(--font-mono);
  color: var(--color-success-text);
}

.markdown-content :deep(pre) {
  background: var(--color-bg-secondary);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
  overflow-x: auto;
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--color-success-solid);
  padding-left: var(--space-4);
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
}

.markdown-content :deep(a) {
  color: var(--color-success-solid);
  text-decoration: underline;
}

.markdown-content :deep(a:active) {
  color: #059669;
}

.markdown-content :deep(hr) {
  margin: var(--space-6) 0;
  border-top: 1px solid var(--color-border-secondary);
}

.result-actions {
  display: flex;
  gap: var(--space-4);
  padding-top: var(--space-4);
}

.action-button {
  flex: 1;
  padding: var(--space-4) var(--space-6);
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 44px;
}

.action-button.primary {
  background: var(--color-success-solid);
  color: white;
}

.action-button.primary:active {
  transform: scale(0.98);
  background: #059669;
}
</style>
