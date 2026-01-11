<template>
  <div class="metric-grid">
    <slot />
  </div>
</template>

<style scoped>
.metric-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
