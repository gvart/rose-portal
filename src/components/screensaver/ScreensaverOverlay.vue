<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="screensaver.isActive.value || isShowing"
        class="screensaver-overlay"
        @click.capture.stop="handleDismiss"
        @touchstart.capture.stop="handleDismiss"
        @keydown.escape="handleDismiss"
        role="dialog"
        aria-modal="true"
        aria-label="Screensaver - Tap to dismiss"
        tabindex="-1"
      >
        <!-- Particles Background -->
        <vue-particles
          id="tsparticles"
          :options="particlesOptions"
        />

        <!-- Content Layer -->
        <div class="screensaver-content">
          <!-- ROSE Text -->
          <h1 class="screensaver-title">ROSE</h1>

          <!-- Clock Display -->
          <div class="screensaver-time">
            <div class="time-display">{{ displayTime }}</div>
            <div class="date-display">{{ displayDate }}</div>
          </div>

          <!-- Unlock Hint -->
          <p class="screensaver-hint">Tap anywhere to unlock</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useScreensaver } from '@/composables/useScreensaver'
import { useDarkMode } from '@/composables/useDarkMode'
import { useClock } from '@/composables/useClock'
import { useHapticFeedback } from '@/composables/useHapticFeedback'
import { useAuthFlow } from '@/composables/useAuthFlow'

const screensaver = useScreensaver()
const { isDark } = useDarkMode()
const { currentTime } = useClock()
const { vibrate } = useHapticFeedback()
const { triggerUserSelection } = useAuthFlow()

// Track if screensaver is currently showing (prevents race conditions)
const isShowing = ref(false)

// Format time display (24-hour format)
const displayTime = computed(() => {
  return currentTime.value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
})

// Format date display
const displayDate = computed(() => {
  return currentTime.value.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
})

// Theme-aware particle configuration (macOS-style)
const particlesOptions = computed(() => ({
  background: {
    color: {
      value: 'transparent'
    }
  },
  fpsLimit: 60,
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        area: 800
      }
    },
    color: {
      value: isDark.value
        ? ['#60A5FA', '#34D399', '#A78BFA']  // Dark mode: blue, green, purple
        : ['#3B82F6', '#10B981', '#8B5CF6']  // Light mode: brighter variants
    },
    shape: {
      type: 'polygon',
      polygon: {
        sides: 6  // Hexagon
      }
    },
    opacity: {
      value: { min: 0.1, max: 0.5 },
      animation: {
        enable: true,
        speed: 1,
        sync: false
      }
    },
    size: {
      value: { min: 1, max: 3 }
    },
    move: {
      enable: true,
      speed: 0.5,
      direction: 'none',
      random: true,
      straight: false,
      outModes: {
        default: 'out'
      }
    },
    links: {
      enable: true,
      distance: 150,
      color: isDark.value ? '#60A5FA' : '#3B82F6',
      opacity: 0.2,
      width: 1
    }
  },
  interactivity: {
    events: {
      onClick: {
        enable: false
      },
      onHover: {
        enable: false
      }
    }
  },
  detectRetina: true
}))

// Dismiss screensaver with haptic feedback
function handleDismiss() {
  if (!isShowing.value) {
    return
  }

  vibrate('light')
  isShowing.value = false

  // Force reset isIdle to false (bypasses shouldIgnoreActivity check)
  screensaver.forceResetIdle()

  // Trigger user selection after screensaver dismissal
  triggerUserSelection()

  // Restart idle tracking for next cycle
  screensaver.startIdleTracking()
}

// Lock body scroll when screensaver is active
// Also stop idle detection to prevent it from interfering with dismiss
watch(
  () => screensaver.isActive.value,
  (isActive) => {
    if (isActive && !isShowing.value) {
      isShowing.value = true
      document.body.style.overflow = 'hidden'
      // Stop idle detection while screensaver is showing
      screensaver.stopIdleTracking()
    } else if (!isActive && isShowing.value) {
      isShowing.value = false
      document.body.style.overflow = ''
      screensaver.startIdleTracking()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.screensaver-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--color-bg-primary);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Make particles layer pass through pointer events */
.screensaver-overlay :deep(#tsparticles),
.screensaver-overlay :deep(#tsparticles canvas) {
  pointer-events: none !important;
}

.screensaver-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-8);
  padding: var(--space-8);
  pointer-events: none;
}

.screensaver-content > * {
  pointer-events: none;
}

.screensaver-title {
  font-size: 96px;
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: pulse-glow 4s ease-in-out infinite;
}

@media (max-width: 640px) {
  .screensaver-title {
    font-size: 64px;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.screensaver-time {
  text-align: center;
}

.time-display {
  font-size: 64px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  margin-bottom: var(--space-2);
}

@media (max-width: 640px) {
  .time-display {
    font-size: 48px;
  }
}

.date-display {
  font-size: var(--font-size-24);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  text-align: center;
}

@media (max-width: 640px) {
  .date-display {
    font-size: var(--font-size-18);
  }
}

.screensaver-hint {
  font-size: var(--font-size-13);
  color: var(--color-text-faint);
  opacity: 0;
  animation: fade-in-out 3s ease-in-out infinite;
  animation-delay: 2s;
}

@keyframes fade-in-out {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 0.6;
  }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-slow) var(--ease-in-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .screensaver-title,
  .screensaver-hint {
    animation: none;
    opacity: 1;
  }
}
</style>
