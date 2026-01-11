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
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border-primary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  text-align: left;
  width: 100%;
  min-height: 100px;
  background-color: var(--color-bg-primary);
}

.dish-select-item:active:not(.selected) {
  border-color: var(--color-success-border);
}

.dish-select-item.selected {
  border-color: var(--color-success-solid);
  background-color: var(--color-success-bg);
}

.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  padding-top: var(--space-1);
  min-width: 44px;
  min-height: 44px;
}

.checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-border-primary);
  transition: all var(--duration-fast) var(--ease-in-out);
  width: 24px;
  height: 24px;
  background-color: var(--color-bg-primary);
}

.checkbox.checked {
  border-color: var(--color-success-solid);
  background-color: var(--color-success-solid);
}

.check-icon {
  width: 16px;
  height: 16px;
  color: white;
}

.dish-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.dish-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.dish-name {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  flex: 1;
}

.prep-time {
  padding: var(--space-1) var(--space-2);
  background: var(--color-success-bg);
  color: var(--color-success-text);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.dish-description {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
