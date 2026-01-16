<template>
  <div class="empty-state">
    <div class="empty-state__icon" v-if="!hideIcon">
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" :d="currentIconPath" />
        </svg>
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
        <button
          v-if="actionLabel"
         
          @click="$emit('action')"
          class="empty-state__button"
        >
          {{ actionLabel }}
        </button>
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

// Icon paths for each type
const iconPaths = {
  plant: 'M12 3v13.5m0-13.5c-3 0-6 1.5-6 4.5 0 1.657 1.343 3 3 3s3-1.343 3-3m0 0c0 3 3 4.5 6 4.5 1.657 0 3-1.343 3-3 0-3-3-4.5-6-4.5 M12 16.5V21m-6-3h12',
  calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  recipe: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  search: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
  folder: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z'
}

const currentIconPath = computed(() => iconPaths[props.icon] || iconPaths.folder)
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
  color: var(--color-border-secondary);
  margin-bottom: var(--space-6);
  animation: fadeInScale 0.4s var(--ease-in-out);
}

.empty-state__icon :deep(svg) {
  width: 64px;
  height: 64px;
  margin: 0 auto;
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

.empty-state__button {
  min-width: var(--space-11);
  min-height: var(--space-11);
  padding: var(--space-3) var(--space-6);
  background: var(--color-accent-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  transition: all var(--duration-normal) var(--ease-in-out);
  cursor: pointer;
}

.empty-state__button:active {
  transform: scale(0.96);
  background: var(--color-accent-primary-active);
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
