<template>
  <q-layout view="hHh lpR fFf" :style="{ '--theme-color': themeColor }">
    <q-header bordered class="bg-white text-dark">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="chevron_left"
          @click="goBack"
          aria-label="Go back"
          color="grey-8"
        />
        <q-toolbar-title class="text-center text-weight-medium">
          {{ title }}
        </q-toolbar-title>
        <q-btn flat dense round icon="chevron_left" class="invisible" />
      </q-toolbar>
      <div class="header-accent"></div>
    </q-header>

    <q-page-container>
      <q-page class="app-content">
        <div ref="contentRef" class="page-wrapper">
          <slot />
        </div>
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
  console.log('Back button clicked') // Debug log
  // Use browser history to go back
  if (window.history.length > 1) {
    console.log('Going back in history')
    router.back()
  } else {
    // Fallback to home if no history
    console.log('Navigating to home')
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
  background: var(--color-bg-secondary);
}

.page-wrapper {
  padding: var(--space-5);
  min-height: 100%;
  width: 100%;
}

.invisible {
  visibility: hidden;
}

/* Ensure toolbar buttons are properly sized and clickable */
:deep(.q-toolbar .q-btn) {
  min-width: 40px;
  min-height: 40px;
}
</style>
