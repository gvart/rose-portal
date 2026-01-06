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
  @apply bg-white rounded-2xl border-2 border-gray-200 p-6;
}

.category-header {
  @apply flex items-center justify-between mb-4 pb-4 border-b border-gray-200;
}

.category-name {
  @apply text-2xl font-bold text-gray-800;
}

.dishes-list {
  @apply flex flex-col gap-3;
}
</style>
