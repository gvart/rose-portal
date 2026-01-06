<template>
  <div class="app-layout" :style="{ '--theme-color': themeColor }">
    <!-- Floating Glass Header -->
    <header class="app-header-glass">
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
  background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  min-height: 100vh;
}

.app-header-glass {
  position: fixed;
  top: var(--safe-top);
  left: 0;
  right: 0;
  z-index: 100;
  overflow: hidden;

  /* Enhanced glassmorphism */
  background: var(--glass-bg-primary);
  backdrop-filter: var(--glass-blur-strong);
  -webkit-backdrop-filter: var(--glass-blur-strong);

  border-bottom: var(--glass-border);
  box-shadow: var(--glass-shadow-md);

  transition: all 0.3s var(--spring-smooth);
}

.header-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
}

.app-title {
  flex: 1;
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.spacer {
  width: 44px;
}

.header-accent {
  height: 3px;
  background: var(--theme-color);
  box-shadow: 0 0 8px var(--theme-color);
}

.app-content {
  padding: 20px;
  padding-top: 80px;
  padding-bottom: calc(20px + var(--safe-bottom));
}
</style>
