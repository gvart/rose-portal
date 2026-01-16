<template>
  <div class="error-container">
    <div class="error-icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    </div>
    <p class="error-message">{{ message }}</p>
    <button @click="$emit('retry')" class="retry-button">
      Try Again
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()

defineEmits<{
  retry: []
}>()
</script>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-8);
  background: var(--color-error-bg);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-error-border);
  max-width: 448px;
  margin: 0 auto;
}

.error-icon {
  width: 64px;
  height: 64px;
  color: var(--color-error-solid);
}

.icon {
  width: 100%;
  height: 100%;
}

.error-message {
  color: var(--color-error-text);
  font-size: var(--font-size-16);
  text-align: center;
  font-weight: var(--font-weight-medium);
}

.retry-button {
  padding: var(--space-3) var(--space-6);
  min-width: var(--space-11);
  min-height: var(--space-11);
  background: var(--color-error-solid);
  color: white;
  border-radius: var(--radius-md);
  border: none;
  transition: all var(--duration-fast) var(--ease-in-out);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.retry-button:active {
  transform: scale(0.96);
  opacity: 0.9;
}
</style>
