<template>
  <q-card class="metric-card">
    <q-card-section>
      <h3 class="metric-card__title">{{ title }}</h3>
      <div class="metric-card__content">
        <slot />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style scoped>
.metric-card__title {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
}

.metric-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
