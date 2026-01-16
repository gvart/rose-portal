<template>
  <div class="loading-container">
    <q-spinner
      color="primary"
      size="64px"
      :thickness="4"
    />
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-8);
}

.loading-message {
  color: var(--color-text-secondary);
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-medium);
}
</style>
