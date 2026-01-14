<template>
  <Teleport to="body">
    <Transition name="onboarding-fade">
      <div v-if="modelValue" class="onboarding-overlay">
        <!-- Pulsing highlight box positioned over target -->
        <div
          class="onboarding-highlight"
          :style="highlightStyle"
        />

        <!-- Floating tooltip with arrow -->
        <div
          class="onboarding-tooltip"
          :style="tooltipStyle"
        >
          <div class="onboarding-arrow" />
          <div class="onboarding-content">
            <div class="onboarding-icon">👆</div>
            <h3 class="onboarding-title">Long press to see actions</h3>
            <p class="onboarding-text">
              Hold down on any task card to open the action menu
            </p>
            <button
              class="onboarding-dismiss"
              @click="$emit('dismiss')"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  modelValue: boolean
  targetElement?: HTMLElement | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'dismiss': []
}>()

const highlightStyle = ref({})
const tooltipStyle = ref({})

// Calculate positions based on target element
onMounted(() => {
  if (props.targetElement) {
    const rect = props.targetElement.getBoundingClientRect()

    // Position highlight box
    highlightStyle.value = {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    }

    // Position tooltip below target with arrow
    tooltipStyle.value = {
      top: `${rect.bottom + 16}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)'
    }
  }
})
</script>

<style scoped>
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  pointer-events: none;
}

.onboarding-highlight {
  position: absolute;
  border: 3px solid var(--color-accent-primary, #3B82F6);
  border-radius: var(--radius-lg, 12px);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
  animation: pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(59, 130, 246, 0.1);
  }
}

.onboarding-tooltip {
  position: absolute;
  background: white;
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-4, 16px);
  max-width: 280px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  animation: tooltip-bounce 0.5s ease-out;
}

@keyframes tooltip-bounce {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px);
  }
  60% {
    transform: translateX(-50%) translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.onboarding-arrow {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid white;
}

.onboarding-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3, 12px);
  text-align: center;
}

.onboarding-icon {
  font-size: 32px;
}

.onboarding-title {
  font-size: var(--font-size-16, 16px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-text-primary, #0f172a);
  margin: 0;
}

.onboarding-text {
  font-size: var(--font-size-14, 14px);
  color: var(--color-text-secondary, #475569);
  margin: 0;
  line-height: 1.5;
}

.onboarding-dismiss {
  width: 100%;
  padding: var(--space-3, 12px);
  background: var(--color-accent-primary, #3B82F6);
  color: white;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-size-14, 14px);
  font-weight: var(--font-weight-semibold, 600);
  cursor: pointer;
  transition: background var(--duration-fast, 150ms);
}

.onboarding-dismiss:active {
  background: #2563eb;
}

.onboarding-fade-enter-active,
.onboarding-fade-leave-active {
  transition: opacity 0.3s ease;
}

.onboarding-fade-enter-from,
.onboarding-fade-leave-to {
  opacity: 0;
}
</style>
