<template>
  <button
    class="clothing-btn"
    :disabled="state === 'loading' || disabled"
    @click="$emit('click')"
    v-haptic
  >
    <div class="btn-content">
      <!-- Loading state -->
      <Icon
        v-if="state === 'loading'"
        icon="mdi:loading"
        class="btn-icon spin"
        :width="20"
        :height="20"
      />

      <!-- Ready state -->
      <Icon
        v-else-if="state === 'ready'"
        icon="mdi:tshirt-crew"
        class="btn-icon"
        :width="20"
        :height="20"
      />

      <!-- Error state -->
      <Icon
        v-else-if="state === 'error'"
        icon="mdi:alert-circle-outline"
        class="btn-icon"
        :width="20"
        :height="20"
      />

      <!-- Idle state (fallback) -->
      <Icon v-else icon="mdi:tshirt-crew" class="btn-icon" :width="20" :height="20" />

      <span class="btn-text">{{ buttonText }}</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = withDefaults(
  defineProps<{
    state: 'idle' | 'loading' | 'ready' | 'error'
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

defineEmits<{
  click: []
}>()

const buttonText = computed(() => {
  switch (props.state) {
    case 'loading':
      return 'Loading...'
    case 'error':
      return 'Retry'
    case 'ready':
      return 'What to Wear'
    default:
      return 'What to Wear'
  }
})
</script>

<style scoped>
.clothing-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 350px;
  margin: var(--space-4) auto 0;
  padding: var(--space-3) var(--space-6);
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-lg);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);
  outline: none;
}

.clothing-btn:active:not(:disabled) {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(0.98);
}

.clothing-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-icon {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  flex-shrink: 0;
}

.btn-text {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
