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
  @apply p-6 rounded-xl border border-gray-200 bg-white;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.skeleton-header {
  @apply flex flex-col gap-2;
}

.skeleton-description {
  @apply flex flex-col gap-2;
}
</style>
