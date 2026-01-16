<template>
  <div class="empty-state">
    <div class="empty-state__icon" v-if="!hideIcon">
      <slot name="icon">
        <q-icon :name="currentIcon" size="64px" color="grey-5" />
      </slot>
    </div>

    <h3 class="empty-state__title">
      <slot name="title">{{ title }}</slot>
    </h3>

    <p v-if="description || $slots.description" class="empty-state__description">
      <slot name="description">{{ description }}</slot>
    </p>

    <div v-if="$slots.action || actionLabel" class="empty-state__action">
      <slot name="action">
        <q-btn
          v-if="actionLabel"
          color="primary"
          :label="actionLabel"
          @click="$emit('action')"
          unelevated
          class="empty-state__button"
        />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface EmptyStateProps {
  /** Icon to display (name of common icon) */
  icon?: 'plant' | 'calendar' | 'recipe' | 'search' | 'folder'
  /** Hide icon completely */
  hideIcon?: boolean
  /** Title text */
  title: string
  /** Optional description text */
  description?: string
  /** Optional action button label */
  actionLabel?: string
}

const props = withDefaults(defineProps<EmptyStateProps>(), {
  icon: 'folder',
  hideIcon: false
})

defineEmits<{
  action: []
}>()

// Map icon types to Material Icons
const iconMap = {
  plant: 'spa',
  calendar: 'event',
  recipe: 'menu_book',
  search: 'search',
  folder: 'folder'
}

const currentIcon = computed(() => iconMap[props.icon] || iconMap.folder)
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-6);
  text-align: center;
  min-height: 240px;
}

.empty-state__icon {
  margin-bottom: var(--space-6);
  animation: fadeInScale 0.4s var(--ease-in-out);
}

.empty-state__title {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
  animation: fadeInUp 0.5s var(--ease-in-out);
  animation-delay: 0.1s;
  animation-fill-mode: both;
}

.empty-state__description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-14);
  max-width: 448px;
  animation: fadeInUp 0.5s var(--ease-in-out);
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

.empty-state__action {
  margin-top: var(--space-6);
  animation: fadeInUp 0.5s var(--ease-in-out);
  animation-delay: 0.3s;
  animation-fill-mode: both;
}

.empty-state__button:deep(.q-btn__content) {
  font-weight: var(--font-weight-semibold);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(var(--space-3));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
