<template>
  <div class="meal-type-selector">
    <label class="selector-label">Meal Type</label>
    <div class="type-chips">
      <button
        v-haptic
        v-for="type in mealTypes"
        :key="type"
        @click="$emit('update:modelValue', type)"
        :class="['type-chip', { active: modelValue === type }]"
      >
        {{ formatMealType(type) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MealType, formatMealType } from '../types'

defineProps<{
  modelValue: MealType | null
}>()

defineEmits<{
  'update:modelValue': [value: MealType]
}>()

const mealTypes = [MealType.BREAKFAST, MealType.BRUNCH, MealType.LUNCH, MealType.DINNER]
</script>

<style scoped>
.meal-type-selector {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.selector-label {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.type-chips {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.type-chip {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--ease-in-out);
  border: 2px solid var(--color-border-primary);
  cursor: pointer;
  min-height: 48px;
  min-width: 120px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}

.type-chip:active:not(.active) {
  background-color: var(--color-success-bg);
  border-color: var(--color-success-border);
}

.type-chip.active {
  background-color: var(--color-success-solid);
  border-color: var(--color-success-solid);
  color: white;
}

.type-chip.active:active {
  background-color: #059669;
  border-color: #059669;
}
</style>
