<template>
  <q-skeleton
    :type="skeletonType"
    :width="computedWidth"
    :height="computedHeight"
    :animation="animate ? 'wave' : 'none'"
    :style="customStyle"
  >
    <slot />
  </q-skeleton>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface LoadingSkeletonProps {
  /** Skeleton variant */
  variant?: 'text' | 'rectangular' | 'circular' | 'card'
  /** Width (CSS value or number in px) */
  width?: string | number
  /** Height (CSS value or number in px) */
  height?: string | number
  /** Border radius (CSS value) */
  borderRadius?: string
  /** Enable pulse animation */
  animate?: boolean
}

const props = withDefaults(defineProps<LoadingSkeletonProps>(), {
  variant: 'rectangular',
  animate: true
})

// Map our variant types to Quasar skeleton types
const skeletonType = computed(() => {
  switch (props.variant) {
    case 'text':
      return 'text'
    case 'circular':
      return 'circle'
    case 'card':
    case 'rectangular':
    default:
      return 'rect'
  }
})

const computedWidth = computed(() => {
  if (props.width) {
    return typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  return props.variant === 'text' ? '100%' : undefined
})

const computedHeight = computed(() => {
  if (props.height) {
    return typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  if (props.variant === 'text') return '16px'
  if (props.variant === 'card') return '120px'
  return undefined
})

const customStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.borderRadius) {
    style.borderRadius = props.borderRadius
  }

  return style
})
</script>

<style scoped>
/* QSkeleton handles most styling, just add custom overrides if needed */
</style>
