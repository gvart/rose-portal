<template>
  <div class="meal-type-selector">
    <label class="selector-label">Meal Type</label>
    <div class="type-chips">
      <q-chip
        v-for="type in mealTypes"
        :key="type"
        :label="formatMealType(type)"
        clickable
        :color="modelValue === type ? 'positive' : undefined"
        :outline="modelValue !== type"
        @click="$emit('update:modelValue', type)"
        class="type-chip"
      />
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
  min-height: 48px;
  min-width: 120px;
}
</style>
