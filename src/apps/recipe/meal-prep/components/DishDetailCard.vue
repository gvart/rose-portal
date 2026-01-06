<template>
  <div class="dish-detail-card">
    <div class="dish-header">
      <div class="header-main">
        <h3 class="dish-name">{{ dish.name }}</h3>
        <div class="dish-meta">
          <span v-if="dish.type" class="meta-badge meal-type">{{ formatMealType(dish.type) }}</span>
          <span class="meta-badge prep-time">{{ dish.preparationTime }} min</span>
        </div>
      </div>
      <p class="dish-description">{{ dish.description }}</p>
    </div>

    <div v-if="dish.attributes && dish.attributes.length > 0" class="attributes-section">
      <h4 class="section-label">Attributes</h4>
      <div class="attributes-tags">
        <span
          v-for="attribute in dish.attributes"
          :key="attribute"
          class="attribute-tag"
        >
          {{ formatAttribute(attribute) }}
        </span>
      </div>
    </div>

    <div v-if="dish.ingredients.length > 0" class="ingredients-section">
      <h4 class="section-label">Ingredients</h4>
      <ul class="ingredients-list">
        <li
          v-for="(ingredient, index) in dish.ingredients"
          :key="index"
          class="ingredient-item"
        >
          <span class="ingredient-quantity">{{ ingredient.quantity }}</span>
          <span class="ingredient-unit">{{ formatUnit(ingredient.unitType) }}</span>
          <span class="ingredient-name">{{ ingredient.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatMealType, formatAttribute, type DishDetail } from '../types'

defineProps<{
  dish: DishDetail
}>()

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
.dish-detail-card {
  @apply bg-white rounded-xl border-2 border-emerald-200 p-6
         flex flex-col gap-6;
}

.dish-header {
  @apply flex flex-col gap-3 pb-4 border-b border-gray-200;
}

.header-main {
  @apply flex flex-col gap-2;
}

.dish-name {
  @apply text-2xl font-bold text-gray-800;
}

.dish-meta {
  @apply flex gap-2 flex-wrap;
}

.meta-badge {
  @apply px-3 py-1 rounded-full text-sm font-semibold;
}

.meal-type {
  @apply bg-emerald-100 text-emerald-700;
}

.prep-time {
  @apply bg-blue-100 text-blue-700;
}

.dish-description {
  @apply text-base text-gray-600 leading-relaxed;
}

.attributes-section {
  @apply flex flex-col gap-3;
}

.section-label {
  @apply text-sm font-bold text-gray-700 uppercase tracking-wide;
}

.attributes-tags {
  @apply flex flex-wrap gap-2;
}

.attribute-tag {
  @apply px-3 py-1 bg-gray-100 text-gray-700 rounded-full
         text-sm font-medium;
}

.ingredients-section {
  @apply flex flex-col gap-3;
}

.ingredients-list {
  @apply flex flex-col gap-2;
}

.ingredient-item {
  @apply flex items-baseline gap-2 text-base;
}

.ingredient-quantity {
  @apply font-semibold text-emerald-700 min-w-[3rem] text-right;
}

.ingredient-unit {
  @apply text-gray-500 min-w-[3rem];
}

.ingredient-name {
  @apply text-gray-800;
}
</style>
