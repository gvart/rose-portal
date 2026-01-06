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
  @apply flex gap-3 p-3 rounded-lg;
  background: rgba(255, 255, 255, 0.5);
  min-height: 72px;
}

.skeleton-time {
  @apply w-16 flex-shrink-0;
}

.skeleton-content {
  @apply flex gap-3 flex-1;
}

.skeleton-details {
  @apply flex flex-col gap-2 flex-1;
}
</style>
