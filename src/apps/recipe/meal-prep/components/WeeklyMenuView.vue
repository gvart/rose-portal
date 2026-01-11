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

.menu-sections {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.meal-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-3);
  border-bottom: 2px solid var(--color-success-solid);
}

.section-title {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.dish-count {
  padding: var(--space-1) var(--space-3);
  background: var(--color-success-bg);
  color: var(--color-success-text);
  border-radius: var(--radius-full);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.dishes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .dishes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
