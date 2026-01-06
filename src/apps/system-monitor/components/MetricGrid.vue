<template>
  <div class="metric-grid">
    <slot />
  </div>
</template>

<style scoped>
.metric-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}
</style>
