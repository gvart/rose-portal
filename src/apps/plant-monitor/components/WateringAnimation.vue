<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="show" class="watering-overlay">
        <div class="watering-content">
          <div class="water-drops">
            <div class="drop drop-1"></div>
            <div class="drop drop-2"></div>
            <div class="drop drop-3"></div>
            <div class="drop drop-4"></div>
            <div class="drop drop-5"></div>
          </div>

          <div class="watering-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-24 h-24 text-blue-500">
              <path
                d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
            </svg>
          </div>

          <h2 class="watering-title">Watering Plant...</h2>

          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
            </div>
            <p class="progress-text">{{ remainingSeconds }}s remaining</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  show: boolean
  durationMs: number
}

const props = defineProps<Props>()

const elapsed = ref(0)
let intervalId: number | null = null

const progress = computed(() => {
  if (props.durationMs === 0) return 0
  return Math.min((elapsed.value / props.durationMs) * 100, 100)
})

const remainingSeconds = computed(() => {
  const remaining = Math.max(0, props.durationMs - elapsed.value)
  return Math.ceil(remaining / 1000)
})

watch(
  () => props.show,
  (isShowing) => {
    if (isShowing) {
      elapsed.value = 0
      startTimer()
    } else {
      stopTimer()
    }
  }
)

function startTimer() {
  stopTimer()
  intervalId = window.setInterval(() => {
    elapsed.value += 100
    if (elapsed.value >= props.durationMs) {
      stopTimer()
    }
  }, 100)
}

function stopTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}
</script>

<style scoped>
.watering-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  /* Ensure it covers safe areas */
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  padding-left: var(--safe-left);
  padding-right: var(--safe-right);
}

.watering-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-8);
  transition: all 0.4s var(--spring-bounce);
}

.water-drops {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.drop {
  position: absolute;
  border-radius: var(--radius-full);
  background: #60a5fa;
  opacity: 0.6;
  animation: fall 2s infinite;
}

.drop-1 {
  left: 20%;
  width: 8px;
  height: 12px;
  animation-delay: 0s;
}

.drop-2 {
  left: 40%;
  width: 10px;
  height: 15px;
  animation-delay: 0.4s;
}

.drop-3 {
  left: 60%;
  width: 6px;
  height: 10px;
  animation-delay: 0.8s;
}

.drop-4 {
  left: 80%;
  width: 9px;
  height: 13px;
  animation-delay: 1.2s;
}

.drop-5 {
  left: 50%;
  width: 7px;
  height: 11px;
  animation-delay: 1.6s;
}

@keyframes fall {
  0% {
    top: -10%;
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    top: 110%;
    opacity: 0;
  }
}

.watering-icon {
  position: relative;
  z-index: 10;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.watering-title {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  color: white;
  position: relative;
  z-index: 10;
}

.progress-container {
  width: 100%;
  max-width: 28rem;
  position: relative;
  z-index: 10;
}

.progress-bar {
  width: 100%;
  height: var(--space-3);
  background: #374151;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-info-solid);
  border-radius: var(--radius-full);
  transition: width 100ms linear;
}

.progress-text {
  text-align: center;
  color: white;
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  margin-top: var(--space-3);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.overlay-enter-active {
  transition: all 0.4s var(--spring-bounce);
}

.overlay-leave-active {
  transition: all 0.3s ease;
}

.overlay-enter-from {
  opacity: 0;
}

.overlay-enter-from .watering-content {
  transform: scale(0.8);
  opacity: 0;
}

.overlay-enter-to .watering-content {
  transform: scale(1);
  opacity: 1;
}

.overlay-leave-to {
  opacity: 0;
}

.overlay-leave-to .watering-content {
  transform: scale(0.9);
  opacity: 0;
}
</style>
