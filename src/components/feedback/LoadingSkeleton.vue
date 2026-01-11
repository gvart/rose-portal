<template>
  <div :class="['skeleton', variant, { animated: animate }]" :style="customStyle">
    <slot />
  </div>
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

const customStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }

  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }

  if (props.borderRadius) {
    style.borderRadius = props.borderRadius
  }

  return style
})
</script>

<style scoped>
.skeleton {
  background: var(--color-bg-tertiary);
  overflow: hidden;
  position: relative;
}

.skeleton.animated::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Variants */
.skeleton.text {
  height: 16px;
  border-radius: var(--radius-xs);
  width: 100%;
}

.skeleton.rectangular {
  border-radius: var(--radius-md);
}

.skeleton.circular {
  border-radius: var(--radius-full);
}

.skeleton.card {
  border-radius: var(--radius-lg);
  min-height: 120px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .skeleton {
    background: var(--color-bg-tertiary);
  }

  .skeleton.animated::after {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0) 100%
    );
  }
}
</style>
