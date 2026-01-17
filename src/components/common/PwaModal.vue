<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="handleDialogUpdate"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    class="pwa-modal-dialog"
  >
    <q-card class="pwa-modal-card">
      <!-- iOS-style Header with Close (left) and Submit (right) -->
      <q-card-section class="pwa-modal-header">
        <q-btn
          v-if="!hideClose"
          icon="close"
          flat
          round
          dense
          class="pwa-modal-close"
          :disable="loading"
          @click="handleClose"
          aria-label="Close modal"
        />
        <div class="pwa-modal-title">
          <slot name="title">{{ title }}</slot>
        </div>
        <q-btn
          v-if="showSubmit"
          icon="check"
          flat
          round
          dense
          class="pwa-modal-submit"
          :disable="!canSubmit || loading"
          :loading="loading"
          @click="handleSubmit"
          aria-label="Submit"
        />
        <div v-else class="pwa-modal-submit-placeholder" />
      </q-card-section>

      <!-- Swipeable Content Area -->
      <q-card-section
        class="pwa-modal-content"
        :style="panStyle"
        v-touch-pan.vertical="handlePan"
      >
        <slot />
      </q-card-section>

      <!-- Optional Footer Slot -->
      <q-card-actions v-if="$slots.footer" class="pwa-modal-footer">
        <slot name="footer" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  showSubmit?: boolean
  canSubmit?: boolean
  loading?: boolean
  hideClose?: boolean
  swipeToDismiss?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showSubmit: false,
  canSubmit: false,
  loading: false,
  hideClose: false,
  swipeToDismiss: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': []
  'close': []
}>()

const panOffset = ref(0)
const isPanning = ref(false)

const panStyle = computed(() => {
  if (!isPanning.value || panOffset.value <= 0) return {}
  return {
    transform: `translateY(${panOffset.value}px)`,
    transition: 'none'
  }
})

function handleDialogUpdate(value: boolean) {
  if (!value) {
    emit('close')
  }
  emit('update:modelValue', value)
}

function handleClose() {
  if (!props.loading) {
    emit('close')
    emit('update:modelValue', false)
  }
}

function handleSubmit() {
  if (props.canSubmit && !props.loading) {
    emit('submit')
  }
}

function handlePan(details: { delta: { y: number }; isFinal: boolean; direction: string }) {
  if (!props.swipeToDismiss) return

  const { delta, isFinal, direction } = details

  if (!isFinal) {
    // Only allow downward swipes
    if (delta.y > 0 && direction === 'down') {
      isPanning.value = true
      panOffset.value = Math.min(delta.y, 200)
    }
  } else {
    // Dismiss if swiped down more than 100px
    if (delta.y > 100 && direction === 'down') {
      handleClose()
    }
    // Reset with animation
    isPanning.value = false
    panOffset.value = 0
  }
}
</script>

<style scoped>
/* Override Quasar dialog to ensure full screen */
.pwa-modal-dialog :deep(.q-dialog__backdrop) {
  background: rgba(0, 0, 0, 0.4);
}

.pwa-modal-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--color-bg-primary);
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
}

/* iOS-style Header */
.pwa-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  padding-top: max(var(--space-3), env(safe-area-inset-top));
  border-bottom: var(--depth-1-border);
  background: var(--color-bg-primary);
  flex-shrink: 0;
  min-height: 56px;
  position: relative;
}

.pwa-modal-close {
  position: absolute;
  left: var(--space-2);
  color: var(--color-text-primary);
  min-width: 44px;
  min-height: 44px;
}

.pwa-modal-title {
  flex: 1;
  text-align: center;
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  letter-spacing: var(--letter-spacing-tight);
  padding: 0 var(--space-11);
}

.pwa-modal-submit {
  position: absolute;
  right: var(--space-2);
  color: var(--color-accent-primary);
  min-width: 44px;
  min-height: 44px;
}

.pwa-modal-submit-placeholder {
  width: 44px;
  height: 44px;
}

/* Content Area */
.pwa-modal-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: var(--space-4);
  padding-bottom: max(var(--space-4), env(safe-area-inset-bottom));
  background: var(--color-bg-primary);
  will-change: transform;
}

.pwa-modal-content::-webkit-scrollbar {
  width: 6px;
}

.pwa-modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.pwa-modal-content::-webkit-scrollbar-thumb {
  background: var(--color-border-secondary);
  border-radius: 3px;
}

.pwa-modal-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}

/* Optional Footer */
.pwa-modal-footer {
  padding: var(--space-4);
  padding-bottom: max(var(--space-4), env(safe-area-inset-bottom));
  border-top: var(--depth-1-border);
  background: var(--color-bg-primary);
  flex-shrink: 0;
}

/* Slide-up Animation */
:deep(.slide-up-enter-active),
:deep(.slide-up-leave-active) {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

:deep(.slide-up-enter-from) {
  transform: translateY(100%);
}

:deep(.slide-up-leave-to) {
  transform: translateY(100%);
}

/* Slide-down Animation */
:deep(.slide-down-enter-active),
:deep(.slide-down-leave-active) {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

:deep(.slide-down-enter-from) {
  transform: translateY(100%);
}

:deep(.slide-down-leave-to) {
  transform: translateY(100%);
}

/* Active state for touch */
.pwa-modal-close:active,
.pwa-modal-submit:active {
  background: var(--color-bg-active);
}

/* Disabled state */
.pwa-modal-submit:disabled {
  opacity: 0.4;
  color: var(--color-text-muted);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pwa-modal-header {
    padding: var(--space-2) var(--space-3);
    padding-top: max(var(--space-2), env(safe-area-inset-top));
  }

  .pwa-modal-content {
    padding: var(--space-3);
    padding-bottom: max(var(--space-3), env(safe-area-inset-bottom));
  }

  .pwa-modal-footer {
    padding: var(--space-3);
    padding-bottom: max(var(--space-3), env(safe-area-inset-bottom));
  }
}
</style>
