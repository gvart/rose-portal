<template>
  <div class="app-layout" :style="{ '--theme-color': themeColor }">
    <!-- App Header -->
    <header class="app-header">
      <div class="header-content">
        <BackButton @click="goBack" />
        <h1 class="app-title">{{ title }}</h1>
        <div class="spacer"></div>
      </div>
      <div class="header-accent"></div>
    </header>

    <!-- Main Content -->
    <main ref="contentRef" class="app-content">
      <slot />
    </main>

    <!-- Swipe gesture indicator -->
    <SwipeIndicator :progress="swipeProgress" :distance="swipeDistance" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BackButton from '@/components/common/BackButton.vue'
import SwipeIndicator from '@/components/common/SwipeIndicator.vue'
import { useSwipeGesture } from '@/composables/useSwipeGesture'

defineProps<{
  title: string
  themeColor: string
}>()

const router = useRouter()
const goBack = () => {
  // Use browser history to go back
  if (window.history.length > 1) {
    router.back()
  } else {
    // Fallback to home if no history
    router.push('/')
  }
}

// Swipe gesture setup
const contentRef = ref<HTMLElement | null>(null)
const { swipeProgress, swipeDistance } = useSwipeGesture(contentRef, {
  direction: 'right',
  threshold: 80,
  maxVertical: 30,
  maxDuration: 500,
  edgeZone: 50,
  onSwipe: goBack,
  hapticPattern: 'medium'
})
</script>

<style scoped>
.app-layout {
  background: var(--color-bg-secondary);
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  min-height: 100vh;
}

.app-header {
  position: fixed;
  top: var(--safe-top);
  left: 0;
  right: 0;
  z-index: 100;
  overflow: hidden;

  /* Borders-only depth strategy */
  background: var(--color-bg-primary);
  border-bottom: var(--depth-2-border);

  transition: all var(--duration-normal) var(--ease-in-out);
}

.header-content {
  display: flex;
  align-items: center;
  padding: var(--space-4);
  gap: var(--space-3);
}

.app-title {
  flex: 1;
  text-align: center;
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
}

.spacer {
  width: var(--space-11);
}

.header-accent {
  height: 4px;
  background: var(--theme-color);
  opacity: 0.9;
}

.app-content {
  padding: var(--space-5);
  padding-top: calc(68px + var(--space-6));
  padding-bottom: calc(var(--space-5) + var(--safe-bottom));
}
</style>
