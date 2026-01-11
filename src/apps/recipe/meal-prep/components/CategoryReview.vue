<template>
  <div class="category-review">
    <div class="category-header">
      <h3 class="category-name">{{ category.categoryName }}</h3>
      <RefreshButton :loading="isRefreshing" @click="$emit('refresh')" />
    </div>

    <div class="dishes-list">
      <DishSelectItem
        v-for="dish in category.mealRecommendations"
        :key="dish.id"
        :dish-id="dish.id"
        :dish-name="dish.dishName"
        :preparation-time="dish.preparationTime"
        :description="dish.description"
        :is-selected="isSelected(dish.id)"
        @toggle="$emit('toggle-dish', dish.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import RefreshButton from './RefreshButton.vue'
import DishSelectItem from './DishSelectItem.vue'
import type { MealPrepCategory } from '../types'

const props = defineProps<{
  category: MealPrepCategory
  selectedDishes: Set<string>
  isRefreshing: boolean
}>()

defineEmits<{
  refresh: []
  toggleDish: [dishId: string]
}>()

function isSelected(dishId: string): boolean {
  return props.selectedDishes.has(dishId)
}
</script>

<style scoped>
.category-review {
  background: var(--color-bg-primary);
  border: 2px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-primary);
}

.category-name {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.dishes-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
