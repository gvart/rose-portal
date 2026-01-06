<template>
  <button v-haptic class="back-button" @click="$emit('click')" aria-label="Go back">
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
  @apply min-w-touch min-h-touch flex items-center justify-center
         rounded-lg hover:bg-gray-100 transition-colors duration-200;
}

.back-icon {
  @apply w-8 h-8 text-gray-700;
}
</style>
