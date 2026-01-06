<template>
  <button
    v-haptic
    @click="$emit('click')"
    :disabled="loading"
    class="refresh-button"
  >
    <svg
      v-if="!loading"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      class="refresh-icon"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>

    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      class="spinner-icon"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.refresh-button {
  @apply p-3 rounded-lg bg-emerald-50 text-emerald-700
         hover:bg-emerald-100 transition-all duration-200
         disabled:opacity-50 disabled:cursor-not-allowed;
  min-height: 44px;
  min-width: 44px;
}

.refresh-icon {
  @apply w-5 h-5;
}

.spinner-icon {
  @apply w-5 h-5 animate-spin;
}
</style>
