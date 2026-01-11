<template>
  <span :class="['priority-badge', sizeClass, config.bgColor, config.textColor]">
    {{ config.label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChorePriority, PRIORITY_CONFIGS } from '../types/chores'

interface Props {
  priority: ChorePriority
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const config = computed(() => PRIORITY_CONFIGS[props.priority])

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'priority-badge-sm'
    case 'lg':
      return 'priority-badge-lg'
    default:
      return 'priority-badge-md'
  }
})
</script>

<style scoped>
.priority-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 0.375rem;
  white-space: nowrap;
}

.priority-badge-sm {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  line-height: 1rem;
}

.priority-badge-md {
  padding: 0.25rem 0.625rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.priority-badge-lg {
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5rem;
}

/* Priority colors using inline hex values that match PRIORITY_CONFIGS */
.bg-green-100 {
  background-color: #D1FAE5;
}

.text-green-800 {
  color: #065F46;
}

.bg-amber-100 {
  background-color: #FEF3C7;
}

.text-amber-800 {
  color: #92400E;
}

.bg-red-100 {
  background-color: #FEE2E2;
}

.text-red-800 {
  color: #991B1B;
}
</style>
