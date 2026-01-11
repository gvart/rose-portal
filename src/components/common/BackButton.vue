<template>
  <button v-haptic:light class="back-button" @click="$emit('click')" aria-label="Go back">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="back-icon">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  click: []
}>()
</script>

<style scoped>
.back-button {
  min-width: var(--space-11);
  min-height: var(--space-11);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.back-button:active {
  transform: scale(0.96);
  background: var(--color-bg-active);
}

.back-icon {
  width: 32px;
  height: 32px;
}
</style>
