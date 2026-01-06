<template>
  <div class="metric-card">
    <h3 class="metric-card__title">{{ title }}</h3>
    <div class="metric-card__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style scoped>
.metric-card {
  @apply bg-white rounded-xl shadow-md p-6;
}

.metric-card__title {
  @apply text-lg font-semibold text-gray-800 mb-4;
}

.metric-card__content {
  @apply space-y-3;
}
</style>
