<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <h2 class="modal-title">Meal Plan #{{ planIndex + 1 }}</h2>
            <button @click="closeModal" class="close-button" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="close-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Plan Meta Information -->
          <div class="plan-meta-info">
            <span class="meta-badge">
              {{ plan.dishList.length }} dish{{ plan.dishList.length !== 1 ? 'es' : '' }}
            </span>
            <span class="meta-badge">
              {{ plan.groceryList.length }} ingredient{{ plan.groceryList.length !== 1 ? 's' : '' }}
            </span>
          </div>

          <!-- Tabs -->
          <div class="tabs-container">
            <button
              @click="activeTab = 'dishes'"
              :class="['tab-button', { active: activeTab === 'dishes' }]"
            >
              Dishes
            </button>
            <button
              @click="activeTab = 'grocery'"
              :class="['tab-button', { active: activeTab === 'grocery' }]"
            >
              Grocery List
            </button>
          </div>

          <!-- Modal Content -->
          <div class="modal-content">
            <!-- Dishes Tab -->
            <div v-if="activeTab === 'dishes'" class="dishes-list">
              <div
                v-for="dish in plan.dishList"
                :key="dish.id"
                class="dish-item"
              >
                <div class="dish-main">
                  <h4 class="dish-name">{{ dish.name }}</h4>
                  <span class="dish-time">{{ dish.preparationTime }} min</span>
                </div>
                <div class="dish-description markdown-content" v-html="parseMarkdown(dish.description)"></div>
                <div v-if="dish.ingredients && dish.ingredients.length > 0" class="dish-ingredients">
                  <h5 class="ingredients-title">Ingredients:</h5>
                  <ul class="ingredients-list">
                    <li v-for="(ingredient, idx) in dish.ingredients" :key="idx" class="ingredient-item">
                      {{ ingredient.quantity }} {{ formatUnit(ingredient.unitType) }} {{ ingredient.name }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Grocery List Tab -->
            <div v-else class="grocery-list">
              <div
                v-for="(ingredient, idx) in plan.groceryList"
                :key="idx"
                class="grocery-item"
              >
                <span class="item-quantity">{{ ingredient.quantity }}</span>
                <span class="item-unit">{{ formatUnit(ingredient.unitType) }}</span>
                <span class="item-name">{{ ingredient.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { marked } from 'marked'
import type { WeeklyMenuResponse } from '../types'

interface Props {
  modelValue: boolean
  plan: WeeklyMenuResponse
  planIndex: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const activeTab = ref<'dishes' | 'grocery'>('dishes')

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true
})

function closeModal() {
  emit('update:modelValue', false)
}

function formatUnit(unitType: string): string {
  const unitMap: Record<string, string> = {
    'GRAM': 'g',
    'KILOGRAM': 'kg',
    'LITER': 'L',
    'MILLILITER': 'ml',
    'TEA_SPOON': 'tsp',
    'TABLE_SPOON': 'tbsp',
    'UNIT': '',
    'CUP': 'cup',
    'OUNCE': 'oz',
    'POUND': 'lb'
  }
  return unitMap[unitType] || unitType
}

function parseMarkdown(text: string): string {
  return marked.parse(text) as string
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 50;
}

.modal-container {
  background: var(--color-bg-primary);
  border: var(--depth-3-border);
  box-shadow: var(--depth-3-shadow);
  border-radius: var(--radius-lg);
  max-width: 64rem;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 2px solid var(--color-border-primary);
}

.modal-title {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.close-button {
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 44px;
  min-width: 44px;
}

.close-button:active {
  background: var(--color-bg-secondary);
}

.close-icon {
  width: 24px;
  height: 24px;
  color: var(--color-text-secondary);
}

.plan-meta-info {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6) 0;
}

.meta-badge {
  padding: var(--space-1) var(--space-3);
  background: var(--color-success-bg);
  color: var(--color-success-text);
  border-radius: var(--radius-full);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
}

.tabs-container {
  display: flex;
  gap: var(--space-2);
  border-bottom: 2px solid var(--color-border-primary);
  padding: var(--space-2) var(--space-6) 0;
}

.tab-button {
  padding: var(--space-2) var(--space-4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  border-bottom: 2px solid transparent;
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 44px;
}

.tab-button:active:not(.active) {
  color: var(--color-success-solid);
}

.tab-button.active {
  color: var(--color-success-solid);
  border-bottom-color: var(--color-success-solid);
}

.modal-content {
  overflow-y: auto;
  padding: var(--space-6);
  flex: 1;
}

.dishes-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.dish-item {
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
}

.dish-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.dish-name {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.dish-time {
  padding: var(--space-1) var(--space-3);
  background: var(--color-success-bg);
  color: var(--color-success-text);
  border-radius: var(--radius-full);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.dish-description {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
}

/* Markdown styling */
.markdown-content :deep(p) {
  margin-bottom: var(--space-2);
}

.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-top: var(--space-3);
  margin-bottom: var(--space-2);
}

.markdown-content :deep(h1) {
  font-size: var(--font-size-18);
}

.markdown-content :deep(h2) {
  font-size: var(--font-size-16);
}

.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-size: var(--font-size-14);
}

.markdown-content :deep(strong) {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-left: var(--space-4);
  margin-bottom: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.markdown-content :deep(ul) {
  list-style-type: disc;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
}

.markdown-content :deep(li) {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
}

.markdown-content :deep(code) {
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xs);
  font-size: var(--font-size-12);
  font-family: var(--font-mono);
  color: var(--color-text-primary);
}

.markdown-content :deep(pre) {
  padding: var(--space-2);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-12);
  overflow-x: auto;
  margin-bottom: var(--space-2);
}

.markdown-content :deep(pre code) {
  padding: 0;
  background: transparent;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--color-success-solid);
  padding-left: var(--space-3);
  font-style: italic;
  color: var(--color-text-muted);
  margin: var(--space-2) 0;
}

.markdown-content :deep(a) {
  color: var(--color-success-solid);
  text-decoration: underline;
}

.markdown-content :deep(a:active) {
  color: #059669;
}

.markdown-content :deep(hr) {
  border-top: 1px solid var(--color-border-primary);
  margin: var(--space-3) 0;
}

.dish-ingredients {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border-primary);
}

.ingredients-title {
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.ingredients-list {
  list-style-type: disc;
  list-style-position: inside;
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.ingredient-item {
  margin-left: var(--space-2);
}

.grocery-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.grocery-item {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-16);
}

.item-quantity {
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  color: var(--color-success-text);
  min-width: 3rem;
  text-align: right;
}

.item-unit {
  color: var(--color-text-muted);
  min-width: 3rem;
}

.item-name {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
  opacity: 0;
}
</style>
