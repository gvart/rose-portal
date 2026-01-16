<template>
  <button class="action-item" @click="$emit('click')">
    <div class="action-icon">
      <q-icon :name="icon" size="24px" />
    </div>
    <div class="action-content">
      <span class="action-title">{{ title }}</span>
      <span v-if="description" class="action-description">{{ description }}</span>
    </div>
    <q-icon name="chevron_right" size="20px" class="action-chevron" />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description?: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.action-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  text-align: left;
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 64px;
}

.action-item:active {
  transform: scale(0.98);
  background: var(--color-bg-secondary);
  border-color: var(--color-success-border);
}

.action-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-success-bg);
  border-radius: var(--radius-md);
  color: var(--color-success-solid);
  flex-shrink: 0;
}

.action-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.action-title {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.action-description {
  font-size: var(--font-size-13);
  color: var(--color-text-muted);
  line-height: 1.4;
}

.action-chevron {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .action-item {
    padding: var(--space-5) var(--space-6);
    min-height: 72px;
  }

  .action-icon {
    width: 48px;
    height: 48px;
  }

  .action-title {
    font-size: var(--font-size-18);
  }

  .action-description {
    font-size: var(--font-size-14);
  }
}
</style>
