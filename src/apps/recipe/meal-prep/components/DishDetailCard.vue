<template>
  <q-card class="dish-detail-card">
    <q-card-section class="dish-header">
      <div class="header-main">
        <h3 class="dish-name">{{ dish.name }}</h3>
        <div class="dish-meta">
          <q-chip
            v-if="dish.type"
            dense
            color="positive"
            text-color="white"
            :label="formatMealType(dish.type)"
            class="meal-type"
          />
          <q-chip
            dense
            color="info"
            text-color="white"
            :label="`${dish.preparationTime} min`"
            class="prep-time"
          />
        </div>
      </div>
      <p class="dish-description">{{ dish.description }}</p>
    </q-card-section>

    <q-separator v-if="dish.attributes && dish.attributes.length > 0" />

    <q-card-section v-if="dish.attributes && dish.attributes.length > 0" class="attributes-section">
      <h4 class="section-label">Attributes</h4>
      <div class="attributes-tags">
        <q-chip
          v-for="attribute in dish.attributes"
          :key="attribute"
          dense
          color="grey-3"
          text-color="grey-7"
          :label="formatAttribute(attribute)"
        />
      </div>
    </q-card-section>

    <q-separator v-if="dish.ingredients.length > 0" />

    <q-card-section v-if="dish.ingredients.length > 0" class="ingredients-section">
      <h4 class="section-label">Ingredients</h4>
      <q-list dense class="ingredients-list">
        <q-item
          v-for="(ingredient, index) in dish.ingredients"
          :key="index"
          class="ingredient-item"
        >
          <q-item-section side class="ingredient-quantity">
            {{ ingredient.quantity }}
          </q-item-section>
          <q-item-section side class="ingredient-unit">
            {{ formatUnit(ingredient.unitType) }}
          </q-item-section>
          <q-item-section class="ingredient-name">
            {{ ingredient.name }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
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
  border: 2px solid var(--color-success-border);
  border-radius: var(--radius-lg);
}

.dish-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
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

.prep-time:deep(.q-chip__content) {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.dish-description {
  font-size: var(--font-size-16);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.section-label {
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  margin-bottom: var(--space-2);
}

.attributes-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.ingredients-list {
  padding: 0;
}

.ingredient-item {
  padding: var(--space-1) 0;
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
