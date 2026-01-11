<template>
  <div class="home-layout">
    <!-- Content -->
    <div class="home-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home-layout {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: visible;
  background: var(--color-bg-secondary);
}

.home-content {
  position: relative;
  z-index: 1;
  padding-left: var(--safe-left);
  padding-right: var(--safe-right);
  max-width: 1280px;
  margin: 0 auto;
  padding-top: var(--space-8);
  padding-bottom: var(--space-12);
}

@media (min-width: 640px) {
  .home-content {
    padding-left: var(--space-8);
    padding-right: var(--space-8);
  }
}
</style>
