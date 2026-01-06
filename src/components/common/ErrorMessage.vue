<template>
  <div class="error-container">
    <div class="error-icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    </div>
    <p class="error-message">{{ message }}</p>
    <button v-haptic @click="$emit('retry')" class="retry-button">
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
  @apply flex flex-col items-center justify-center gap-4 p-8
         bg-red-50 rounded-xl border-2 border-red-200 max-w-md mx-auto;
}

.error-icon {
  @apply w-16 h-16 text-red-600;
}

.icon {
  @apply w-full h-full;
}

.error-message {
  @apply text-red-800 text-lg text-center;
}

.retry-button {
  @apply px-6 py-3 min-w-[44px] min-h-[44px] bg-red-600 text-white rounded-lg
         hover:bg-red-700 transition-colors duration-200 font-medium;
}
</style>
