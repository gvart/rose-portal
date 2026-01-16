<template>
  <q-badge
    :color="badgeColor"
    :text-color="badgeTextColor"
    :label="config.label"
    :class="sizeClass"
    class="priority-badge"
  />
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

const badgeColor = computed(() => {
  // Map priority to Quasar colors
  const colorMap: Record<ChorePriority, string> = {
    low: 'positive',
    medium: 'warning',
    high: 'negative'
  }
  return colorMap[props.priority]
})

const badgeTextColor = computed(() => 'white')

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
  font-weight: 600;
  border-radius: 6px;
  white-space: nowrap;
}

.priority-badge-sm {
  padding: 2px 8px;
  font-size: 12px;
}

.priority-badge-md {
  padding: 4px 10px;
  font-size: 14px;
}

.priority-badge-lg {
  padding: 6px 12px;
  font-size: 16px;
}
</style>
