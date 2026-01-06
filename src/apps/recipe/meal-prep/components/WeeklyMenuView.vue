<template>
  <div class="weekly-menu-view">
    <div v-if="weeklyMenu.length === 0" class="empty-state">
      <p class="empty-message">No dishes in your weekly menu yet.</p>
    </div>

    <div v-else class="menu-sections">
      <div
        v-for="(dishes, mealType) in groupedDishes"
        :key="mealType"
        class="meal-section"
      >
        <div class="section-header">
          <h3 class="section-title">{{ mealType === 'UNGROUPED' ? 'All Dishes' : formatMealType(mealType as MealType) }}</h3>
          <span class="dish-count">{{ dishes.length }} dish{{ dishes.length !== 1 ? 'es' : '' }}</span>
        </div>

        <div class="dishes-grid">
          <DishDetailCard
            v-for="dish in dishes"
            :key="dish.id"
            :dish="dish"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DishDetailCard from './DishDetailCard.vue'
import { MealType, formatMealType, type DishDetail } from '../types'

const props = defineProps<{
  weeklyMenu: DishDetail[]
}>()

const groupedDishes = computed(() => {
  const groups: Partial<Record<MealType | 'UNGROUPED', DishDetail[]>> = {}

  props.weeklyMenu.forEach(dish => {
    const type = dish.type || 'UNGROUPED'
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type]!.push(dish)
  })

  // Sort by meal type order: BREAKFAST, BRUNCH, LUNCH, DINNER, UNGROUPED
  const sortedGroups: Partial<Record<MealType | 'UNGROUPED', DishDetail[]>> = {}
  const mealTypeOrder = [MealType.BREAKFAST, MealType.BRUNCH, MealType.LUNCH, MealType.DINNER, 'UNGROUPED' as const]

  mealTypeOrder.forEach(type => {
    if (groups[type]) {
      sortedGroups[type] = groups[type]
    }
  })

  return sortedGroups
})
</script>

<style scoped>
.weekly-menu-view {
  @apply w-full;
}

.empty-state {
  @apply flex items-center justify-center p-12 bg-gray-50 rounded-xl;
}

.empty-message {
  @apply text-lg text-gray-600;
}

.menu-sections {
  @apply flex flex-col gap-8;
}

.meal-section {
  @apply flex flex-col gap-4;
}

.section-header {
  @apply flex items-center justify-between pb-3 border-b-2 border-emerald-500;
}

.section-title {
  @apply text-2xl font-bold text-gray-800;
}

.dish-count {
  @apply px-3 py-1 bg-emerald-100 text-emerald-700
         rounded-full text-sm font-semibold;
}

.dishes-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}
</style>
