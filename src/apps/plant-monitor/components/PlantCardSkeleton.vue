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
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.skeleton-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}

.skeleton-metrics {
  display: flex;
  justify-content: space-around;
  gap: var(--space-4);
}

.skeleton-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}
</style>
