<template>
  <Transition name="fade">
    <div
      v-if="progress > 0"
      class="swipe-indicator"
      :style="{
        '--swipe-progress': progress,
        '--swipe-distance': `${distance}px`
      }"
    >
      <div class="indicator-content">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="arrow-icon"
          :class="{ ready: progress >= 0.9 }"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  progress: number   // 0-1 scale
  distance: number   // Pixel distance
}>()
</script>

<style scoped>
.swipe-indicator {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 80px;
  pointer-events: none;
  z-index: 9999;
  background: linear-gradient(
    to right,
    rgba(34, 197, 94, 0.15),
    transparent
  );
  opacity: var(--swipe-progress);
  transform: translateX(calc(-100% + var(--swipe-distance) * 1px));
  transition: opacity 0.1s ease-out;
}

.indicator-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: var(--space-3);
}

.arrow-icon {
  width: 32px;
  height: 32px;
  color: var(--color-success-solid);
  transform: scale(var(--swipe-progress));
  transition: transform var(--duration-fast) var(--ease-out),
              color var(--duration-fast) var(--ease-out);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.arrow-icon.ready {
  color: var(--color-success-solid);
  transform: scale(1.2);
}

/* Fade transition for enter/leave */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
