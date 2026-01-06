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
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50;
}

.modal-container {
  @apply bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b-2 border-gray-200;
}

.modal-title {
  @apply text-2xl font-bold text-gray-800;
}

.close-button {
  @apply p-2 hover:bg-gray-100 rounded-lg transition-all duration-200;
}

.close-icon {
  @apply w-6 h-6 text-gray-600;
}

.plan-meta-info {
  @apply flex gap-3 px-6 pt-4;
}

.meta-badge {
  @apply px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold;
}

.tabs-container {
  @apply flex gap-2 border-b-2 border-gray-300 px-6 pt-2;
}

.tab-button {
  @apply px-4 py-2 font-semibold text-gray-600
         border-b-2 border-transparent transition-all duration-200
         hover:text-emerald-600;
  min-height: 44px;
}

.tab-button.active {
  @apply text-emerald-600 border-emerald-600;
}

.modal-content {
  @apply overflow-y-auto p-6 flex-1;
}

.dishes-list {
  @apply flex flex-col gap-4;
}

.dish-item {
  @apply p-4 bg-gray-50 rounded-lg border border-gray-200;
}

.dish-main {
  @apply flex items-center justify-between mb-2;
}

.dish-name {
  @apply text-lg font-bold text-gray-800;
}

.dish-time {
  @apply px-3 py-1 bg-emerald-100 text-emerald-700
         rounded-full text-sm font-semibold whitespace-nowrap;
}

.dish-description {
  @apply text-sm text-gray-600 mb-3;
}

/* Markdown styling */
.markdown-content :deep(p) {
  @apply mb-2;
}

.markdown-content :deep(p:last-child) {
  @apply mb-0;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  @apply font-bold text-gray-800 mt-3 mb-2;
}

.markdown-content :deep(h1) {
  @apply text-lg;
}

.markdown-content :deep(h2) {
  @apply text-base;
}

.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  @apply text-sm;
}

.markdown-content :deep(strong) {
  @apply font-semibold text-gray-800;
}

.markdown-content :deep(em) {
  @apply italic;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  @apply ml-4 mb-2 space-y-1;
}

.markdown-content :deep(ul) {
  @apply list-disc;
}

.markdown-content :deep(ol) {
  @apply list-decimal;
}

.markdown-content :deep(li) {
  @apply text-sm text-gray-600;
}

.markdown-content :deep(code) {
  @apply px-1 py-0.5 bg-gray-200 rounded text-xs font-mono text-gray-800;
}

.markdown-content :deep(pre) {
  @apply p-2 bg-gray-100 rounded text-xs overflow-x-auto mb-2;
}

.markdown-content :deep(pre code) {
  @apply p-0 bg-transparent;
}

.markdown-content :deep(blockquote) {
  @apply border-l-4 border-emerald-500 pl-3 italic text-gray-600 my-2;
}

.markdown-content :deep(a) {
  @apply text-emerald-600 hover:text-emerald-700 underline;
}

.markdown-content :deep(hr) {
  @apply border-gray-300 my-3;
}

.dish-ingredients {
  @apply mt-3 pt-3 border-t border-gray-200;
}

.ingredients-title {
  @apply text-sm font-semibold text-gray-700 mb-2;
}

.ingredients-list {
  @apply list-disc list-inside text-sm text-gray-600 space-y-1;
}

.ingredient-item {
  @apply ml-2;
}

.grocery-list {
  @apply flex flex-col gap-2;
}

.grocery-item {
  @apply flex items-baseline gap-2 p-3 bg-gray-50 rounded-lg
         border border-gray-200 text-base;
}

.item-quantity {
  @apply font-semibold text-emerald-700 min-w-[3rem] text-right;
}

.item-unit {
  @apply text-gray-500 min-w-[3rem];
}

.item-name {
  @apply text-gray-800 font-medium;
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
