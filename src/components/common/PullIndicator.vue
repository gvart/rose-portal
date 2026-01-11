<template>
  <Transition name="fade">
    <div
      v-if="state !== 'idle'"
      class="pull-indicator"
      :style="{
        transform: `translateY(${Math.min(distance * 0.5, 50)}px)`,
        opacity: Math.min(progress * 1.5, 1)
      }"
    >
      <!-- Circular progress indicator -->
      <svg
        class="progress-circle"
        :class="{ 'spinning': state === 'refreshing' }"
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Background circle -->
        <circle
          class="circle-bg"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke-width="3"
        />

        <!-- Progress circle -->
        <circle
          v-if="state !== 'refreshing'"
          class="circle-progress"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke-width="3"
          :style="{
            strokeDashoffset: circumference * (1 - progress)
          }"
        />

        <!-- Spinning circle for refreshing state -->
        <circle
          v-else
          class="circle-refresh"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke-width="3"
        />
      </svg>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PullState } from '@/composables/usePullToRefresh'

const props = defineProps<{
  state: PullState
  distance: number   // Pull distance in pixels
  progress: number   // 0-1 scale
}>()

// Calculate circle circumference for stroke-dasharray
const circumference = computed(() => 2 * Math.PI * 20)
</script>

<style scoped>
.pull-indicator {
  position: absolute;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  top: -10px;
  transform-origin: center;
  margin-left: -20px;
  z-index: 1000;
  transition: transform var(--duration-fast) var(--ease-out),
              opacity var(--duration-fast) var(--ease-out);
}

.progress-circle {
  width: 40px;
  height: 40px;
  transform: rotate(-90deg);
}

.circle-bg {
  stroke: var(--color-border-secondary);
}

.circle-progress {
  stroke: var(--color-success-solid);
  stroke-dasharray: v-bind(circumference);
  transition: stroke-dashoffset var(--duration-fast) var(--ease-out);
}

.circle-refresh {
  stroke: var(--color-success-solid);
  stroke-dasharray: 80;
  stroke-dashoffset: 60;
}

.progress-circle.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(270deg);
  }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
