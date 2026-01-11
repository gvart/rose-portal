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
  width: 100%;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

.empty-message {
  font-size: var(--font-size-18);
  color: var(--color-text-secondary);
}

.grocery-container {
  background: var(--color-bg-primary);
  border: 2px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  background: var(--color-success-bg);
  border-bottom: 2px solid var(--color-success-border);
}

.header-title {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.item-count {
  padding: var(--space-1) var(--space-3);
  background: var(--color-success-solid);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.items-list > :not(:last-child) {
  border-bottom: 1px solid var(--color-border-primary);
}

.grocery-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 60px;
}

.grocery-item:active {
  background: var(--color-bg-secondary);
}

.grocery-item.checked {
  background: var(--color-bg-secondary);
}

.grocery-item.checked .item-content {
  opacity: 0.5;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
}

.checkbox-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.checkbox-custom {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-border-primary);
  transition: all var(--duration-fast) var(--ease-in-out);
  width: 24px;
  height: 24px;
  background-color: var(--color-bg-primary);
}

.grocery-item.checked .checkbox-custom {
  border-color: var(--color-success-solid);
  background-color: var(--color-success-solid);
}

.check-icon {
  width: 16px;
  height: 16px;
  color: white;
}

.item-content {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  font-size: var(--font-size-16);
  flex: 1;
  transition: opacity var(--duration-fast) var(--ease-in-out);
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

.list-footer {
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-primary);
}

.clear-button {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--color-error-bg);
  color: var(--color-error-text);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 48px;
}

.clear-button:active {
  background: var(--color-error-border);
}
</style>
