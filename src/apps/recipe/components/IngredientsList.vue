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
  @apply grid grid-cols-1 md:grid-cols-2 gap-3;
}

.ingredient-item {
  @apply flex justify-between items-center p-4 bg-emerald-50
         rounded-lg border border-emerald-200;
}

.ingredient-name {
  @apply text-lg font-medium text-gray-800 capitalize;
}

.ingredient-quantity {
  @apply text-lg font-semibold text-emerald-700;
}
</style>
