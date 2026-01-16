<template>
  <q-layout view="hHh lpR fFf" :style="{ '--theme-color': themeColor }">
    <q-header bordered class="bg-white text-dark">
      <q-toolbar>
        <q-btn flat dense round icon="chevron_left" @click="goBack" />
        <q-toolbar-title class="text-center text-weight-medium">
          {{ title }}
        </q-toolbar-title>
        <q-btn flat dense round class="invisible" />
      </q-toolbar>
      <div class="header-accent"></div>
    </q-header>

    <q-page-container>
      <q-page ref="contentRef" class="app-content">
        <slot />
      </q-page>
    </q-page-container>

    <!-- Swipe gesture indicator -->
    <SwipeIndicator :progress="swipeProgress" :distance="swipeDistance" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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
.header-accent {
  height: 4px;
  background: var(--theme-color);
  opacity: 0.9;
}

.app-content {
  padding: var(--space-5);
  background: var(--color-bg-secondary);
}

.invisible {
  visibility: hidden;
}
</style>
