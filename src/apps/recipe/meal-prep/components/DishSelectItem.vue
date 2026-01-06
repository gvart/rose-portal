<template>
  <button
    v-haptic
    @click="$emit('toggle')"
    :class="['dish-select-item', { selected: isSelected }]"
  >
    <div class="checkbox-wrapper">
      <div :class="['checkbox', { checked: isSelected }]">
        <svg
          v-if="isSelected"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="3"
          stroke="currentColor"
          class="check-icon"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
    </div>

    <div class="dish-content">
      <div class="dish-header">
        <h4 class="dish-name">{{ dishName }}</h4>
        <span class="prep-time">{{ preparationTime }} min</span>
      </div>
      <p class="dish-description">{{ description }}</p>
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  dishId: string
  dishName: string
  preparationTime: number
  description: string
  isSelected: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<style scoped>
.dish-select-item {
  @apply flex gap-4 p-4 rounded-xl border-2 cursor-pointer
         transition-all duration-200 text-left w-full
         hover:shadow-md;
  min-height: 100px;
  border-color: #d1d5db;
  background-color: white;
}

.dish-select-item:hover {
  border-color: #6ee7b7;
}

.dish-select-item.selected {
  border-color: #10b981;
  background-color: #d1fae5;
}

.checkbox-wrapper {
  @apply flex items-start pt-1;
  min-width: 44px;
  min-height: 44px;
}

.checkbox {
  @apply flex items-center justify-center rounded-md border-2
         transition-all duration-200;
  width: 24px;
  height: 24px;
  border-color: #d1d5db;
  background-color: white;
}

.checkbox.checked {
  border-color: #10b981;
  background-color: #10b981;
}

.check-icon {
  @apply w-4 h-4 text-white;
}

.dish-content {
  @apply flex-1 flex flex-col gap-2;
}

.dish-header {
  @apply flex items-center justify-between gap-3;
}

.dish-name {
  @apply text-lg font-semibold text-gray-800 flex-1;
}

.prep-time {
  @apply px-2 py-1 bg-emerald-100 text-emerald-700
         rounded-md text-sm font-medium whitespace-nowrap;
}

.dish-description {
  @apply text-sm text-gray-600 leading-relaxed line-clamp-2;
}
</style>
