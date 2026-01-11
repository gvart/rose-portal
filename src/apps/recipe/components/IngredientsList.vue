<template>
  <div class="ingredients-list">
    <div
      v-for="(ingredient, index) in ingredients"
      :key="index"
      class="ingredient-item"
    >
      <span class="ingredient-name">{{ ingredient.name }}</span>
      <span class="ingredient-quantity">{{ formatQuantityWithUnit(ingredient) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ingredient } from '../types'

defineProps<{
  ingredients: Ingredient[]
}>()

function formatUnit(unitType: string): string {
  const unitMap: Record<string, string> = {
    'GRAM': 'g',
    'KILOGRAM': 'kg',
    'LITER': 'L',
    'MILLILITER': 'ml',
    'TEA_SPOON': 'tsp',
    'TABLE_SPOON': 'tbsp',
    'UNIT': ''
  }
  return unitMap[unitType] || unitType
}

function formatQuantityWithUnit(ingredient: Ingredient): string {
  const quantity = ingredient.quantity % 1 === 0
    ? ingredient.quantity.toString()
    : ingredient.quantity.toFixed(2)
  const unit = formatUnit(ingredient.unitType)
  return unit ? `${quantity} ${unit}` : quantity
}
</script>

<style scoped>
.ingredients-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

@media (min-width: 768px) {
  .ingredients-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.ingredient-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background: var(--color-success-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-success-border);
}

.ingredient-name {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  text-transform: capitalize;
}

.ingredient-quantity {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  color: var(--color-success-text);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
</style>
