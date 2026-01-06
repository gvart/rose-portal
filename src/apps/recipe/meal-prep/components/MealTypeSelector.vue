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
  @apply flex flex-col gap-3;
}

.selector-label {
  @apply text-base font-semibold text-gray-700;
}

.type-chips {
  @apply flex gap-3 flex-wrap;
}

.type-chip {
  @apply px-6 py-3 rounded-full font-medium transition-all duration-200
         border-2 cursor-pointer;
  min-height: 48px;
  min-width: 120px;
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #4b5563;
}

.type-chip:hover {
  background-color: #d1fae5;
  border-color: #6ee7b7;
}

.type-chip.active {
  background-color: #10b981;
  border-color: #10b981;
  color: white;
}

.type-chip.active:hover {
  background-color: #059669;
  border-color: #059669;
}
</style>
