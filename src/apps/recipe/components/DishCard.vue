<template>
  <button class="dish-card" @click="$emit('click')">
    <h3 class="dish-name">{{ dishName }}</h3>
    <p class="dish-description">{{ description }}</p>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  dishName: string
  description: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.dish-card {
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  text-align: left;
  border-left: 4px solid var(--color-success-solid);
  min-height: 120px;
}

.dish-card:active {
  transform: scale(0.96);
  border-color: var(--color-border-secondary);
}

.dish-name {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.dish-description {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
