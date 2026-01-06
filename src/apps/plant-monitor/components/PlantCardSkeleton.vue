<template>
  <div class="plant-card-skeleton">
    <div class="skeleton-header">
      <LoadingSkeleton variant="circular" :width="56" :height="56" />
      <div class="skeleton-info">
        <LoadingSkeleton variant="text" width="120px" height="20px" />
        <LoadingSkeleton variant="text" width="80px" height="16px" />
      </div>
    </div>

    <div class="skeleton-metrics">
      <div class="skeleton-metric">
        <LoadingSkeleton variant="circular" :width="64" :height="64" />
        <LoadingSkeleton variant="text" width="60px" height="14px" />
      </div>
      <div class="skeleton-metric">
        <LoadingSkeleton variant="circular" :width="64" :height="64" />
        <LoadingSkeleton variant="text" width="60px" height="14px" />
      </div>
    </div>

    <LoadingSkeleton variant="rectangular" height="40px" border-radius="12px" />
  </div>
</template>

<script setup lang="ts">
import LoadingSkeleton from '@/components/feedback/LoadingSkeleton.vue'
</script>

<style scoped>
.plant-card-skeleton {
  @apply p-6 rounded-2xl;
  background: var(--glass-bg-primary);
  backdrop-filter: var(--glass-blur-medium);
  -webkit-backdrop-filter: var(--glass-blur-medium);
  border: var(--glass-border);
  box-shadow: var(--glass-shadow-md);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skeleton-header {
  @apply flex items-center gap-4;
}

.skeleton-info {
  @apply flex flex-col gap-2 flex-1;
}

.skeleton-metrics {
  @apply flex justify-around gap-4;
}

.skeleton-metric {
  @apply flex flex-col items-center gap-2;
}
</style>
