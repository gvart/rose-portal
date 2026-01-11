<template>
  <button class="suggestion-chip" @click="$emit('click')">
    {{ label }}
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.suggestion-chip {
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-sm);
  border: 2px solid rgba(16, 185, 129, 0.3);
  background: transparent;
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 48px;
}

.suggestion-chip:active {
  transform: scale(0.95);
  background: var(--color-success-bg);
  border-color: var(--color-success-solid);
}
</style>
