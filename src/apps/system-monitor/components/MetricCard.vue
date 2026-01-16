<template>
  <q-card class="metric-card">
    <q-card-section>
      <div class="metric-header">
        <h3 class="metric-title">{{ title }}</h3>
        <div v-if="icon" class="metric-icon" v-html="icon"></div>
      </div>
      <div class="metric-content">
        <slot />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  icon?: string
}>()
</script>

<style scoped>
.metric-card {
  border-left: 4px solid var(--color-info-solid);
  min-height: 150px;
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.metric-title {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
}

.metric-icon {
  width: 32px;
  height: 32px;
  color: var(--color-info-solid);
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
