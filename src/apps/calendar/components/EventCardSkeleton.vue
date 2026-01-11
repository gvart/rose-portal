<template>
  <div class="event-card-skeleton">
    <div class="skeleton-time">
      <LoadingSkeleton variant="text" width="60px" height="16px" />
    </div>
    <div class="skeleton-content">
      <LoadingSkeleton variant="rectangular" width="4px" height="100%" />
      <div class="skeleton-details">
        <LoadingSkeleton variant="text" width="140px" height="18px" />
        <LoadingSkeleton variant="text" width="80px" height="14px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSkeleton from '@/components/feedback/LoadingSkeleton.vue'
</script>

<style scoped>
.event-card-skeleton {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  min-height: 72px;
}

.skeleton-time {
  width: 64px;
  flex-shrink: 0;
}

.skeleton-content {
  display: flex;
  gap: var(--space-3);
  flex: 1;
}

.skeleton-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}
</style>
