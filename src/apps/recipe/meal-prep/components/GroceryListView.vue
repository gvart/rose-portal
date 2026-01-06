<template>
  <div class="grocery-list-view">
    <div v-if="groceryList.length === 0" class="empty-state">
      <p class="empty-message">No ingredients in your grocery list yet.</p>
    </div>

    <div v-else class="grocery-container">
      <div class="list-header">
        <h3 class="header-title">Shopping List</h3>
        <span class="item-count">{{ groceryList.length }} item{{ groceryList.length !== 1 ? 's' : '' }}</span>
      </div>

      <div class="items-list">
        <label
          v-for="(ingredient, index) in groceryList"
          :key="index"
          :class="['grocery-item', { checked: checkedItems.has(index) }]"
        >
          <div class="checkbox-wrapper">
            <input
              type="checkbox"
              :checked="checkedItems.has(index)"
              @change="toggleItem(index)"
              class="checkbox-input"
            />
            <div class="checkbox-custom">
              <svg
                v-if="checkedItems.has(index)"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="3"
                stroke="currentColor"
                class="check-icon"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </div>

          <div class="item-content">
            <span class="item-quantity">{{ ingredient.quantity }}</span>
            <span class="item-unit">{{ formatUnit(ingredient.unitType) }}</span>
            <span class="item-name">{{ ingredient.name }}</span>
          </div>
        </label>
      </div>

      <div v-if="checkedItems.size > 0" class="list-footer">
        <button @click="clearChecked" class="clear-button">
          Clear Checked ({{ checkedItems.size }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Ingredient } from '../types'

defineProps<{
  groceryList: Ingredient[]
}>()

const checkedItems = ref<Set<number>>(new Set())

function toggleItem(index: number) {
  if (checkedItems.value.has(index)) {
    checkedItems.value.delete(index)
  } else {
    checkedItems.value.add(index)
  }
}

function clearChecked() {
  checkedItems.value.clear()
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
</script>

<style scoped>
.grocery-list-view {
  @apply w-full;
}

.empty-state {
  @apply flex items-center justify-center p-12 bg-gray-50 rounded-xl;
}

.empty-message {
  @apply text-lg text-gray-600;
}

.grocery-container {
  @apply bg-white rounded-2xl border-2 border-gray-200 overflow-hidden;
}

.list-header {
  @apply flex items-center justify-between p-6 bg-emerald-50
         border-b-2 border-emerald-200;
}

.header-title {
  @apply text-2xl font-bold text-gray-800;
}

.item-count {
  @apply px-3 py-1 bg-emerald-600 text-white
         rounded-full text-sm font-semibold;
}

.items-list {
  @apply divide-y divide-gray-200;
}

.grocery-item {
  @apply flex items-center gap-4 p-4 cursor-pointer
         hover:bg-gray-50 transition-all duration-200;
  min-height: 60px;
}

.grocery-item.checked {
  @apply bg-gray-50;
}

.grocery-item.checked .item-content {
  @apply opacity-50;
}

.checkbox-wrapper {
  @apply flex items-center justify-center;
  min-width: 44px;
  min-height: 44px;
}

.checkbox-input {
  @apply sr-only;
}

.checkbox-custom {
  @apply flex items-center justify-center rounded-md border-2
         transition-all duration-200;
  width: 24px;
  height: 24px;
  border-color: #d1d5db;
  background-color: white;
}

.grocery-item.checked .checkbox-custom {
  border-color: #10b981;
  background-color: #10b981;
}

.check-icon {
  @apply w-4 h-4 text-white;
}

.item-content {
  @apply flex items-baseline gap-2 text-base flex-1
         transition-opacity duration-200;
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

.list-footer {
  @apply p-4 bg-gray-50 border-t border-gray-200;
}

.clear-button {
  @apply w-full py-3 px-4 bg-red-100 text-red-700
         font-semibold rounded-lg hover:bg-red-200
         transition-all duration-200;
  min-height: 48px;
}
</style>
