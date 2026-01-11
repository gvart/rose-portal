<template>
  <div class="dish-card-skeleton">
    <div class="skeleton-header">
      <LoadingSkeleton variant="text" width="180px" height="24px" />
      <LoadingSkeleton variant="text" width="100px" height="16px" />
    </div>

    <div class="skeleton-description">
      <LoadingSkeleton variant="text" width="100%" height="14px" />
      <LoadingSkeleton variant="text" width="85%" height="14px" />
      <LoadingSkeleton variant="text" width="60%" height="14px" />
    </div>

    <LoadingSkeleton variant="rectangular" height="36px" border-radius="8px" />
  </div>
</template>

<script setup lang="ts">
import LoadingSkeleton from '@/components/feedback/LoadingSkeleton.vue'
</script>

<style scoped>
.dish-card-skeleton {
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  border: var(--depth-1-border);
  background: var(--color-bg-primary);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-description {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
</style>
