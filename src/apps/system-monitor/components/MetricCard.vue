<template>
  <div class="metric-card">
    <div class="metric-header">
      <h3 class="metric-title">{{ title }}</h3>
      <div v-if="icon" class="metric-icon" v-html="icon"></div>
    </div>
    <div class="metric-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  icon?: string
}>()
</script>

<style scoped>
.metric-card {
  @apply bg-white rounded-xl shadow-md p-6 border-l-4;
  border-left-color: #3b82f6;
  min-height: 150px;
}

.metric-header {
  @apply flex items-center justify-between mb-4;
}

.metric-title {
  @apply text-xl font-semibold text-gray-800;
}

.metric-icon {
  @apply w-8 h-8 text-blue-600;
}

.metric-content {
  @apply space-y-3;
}
</style>
