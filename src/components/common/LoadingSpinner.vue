<template>
  <div class="loading-container">
    <div class="spinner"></div>
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
  @apply flex flex-col items-center justify-center gap-4 p-8;
}

.spinner {
  @apply w-16 h-16 border-4 border-emerald-200 border-t-emerald-600
         rounded-full animate-spin;
}

.loading-message {
  @apply text-gray-600 text-lg;
}
</style>
