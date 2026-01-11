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
  background: var(--color-bg-primary);
  border: 2px solid var(--color-success-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.dish-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-primary);
}

.header-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.dish-name {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.dish-meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.meta-badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
}

.meal-type {
  background: var(--color-success-bg);
  color: var(--color-success-text);
}

.prep-time {
  background: var(--color-info-bg);
  color: var(--color-info-text);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.dish-description {
  font-size: var(--font-size-16);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.attributes-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.section-label {
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.attributes-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.attribute-tag {
  padding: var(--space-1) var(--space-3);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-medium);
}

.ingredients-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.ingredient-item {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  font-size: var(--font-size-16);
}

.ingredient-quantity {
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  color: var(--color-success-text);
  min-width: 3rem;
  text-align: right;
}

.ingredient-unit {
  color: var(--color-text-muted);
  min-width: 3rem;
}

.ingredient-name {
  color: var(--color-text-primary);
}
</style>
