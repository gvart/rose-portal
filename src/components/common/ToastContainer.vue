<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
          @click="dismiss(toast.id)"
        >
          <div class="toast-icon">
            <svg v-if="toast.type === 'success'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="toast.type === 'error'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg v-else-if="toast.type === 'warning'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="toast-message">{{ toast.message }}</p>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: 400px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-primary);
  border: 1px solid;
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  pointer-events: auto;
  min-width: 300px;
}

.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.toast-icon svg {
  width: 100%;
  height: 100%;
}

.toast-message {
  flex: 1;
  margin: 0;
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
}

.toast-success {
  border-color: #10b981;
  background: #ecfdf5;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-success .toast-message {
  color: #065f46;
}

.toast-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-error .toast-message {
  color: #991b1b;
}

.toast-warning {
  border-color: #f59e0b;
  background: #fffbeb;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-warning .toast-message {
  color: #92400e;
}

.toast-info {
  border-color: #3b82f6;
  background: #eff6ff;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-info .toast-message {
  color: #1e40af;
}

/* Transitions */
.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .toast-container {
    bottom: var(--space-4);
    right: var(--space-4);
    left: var(--space-4);
    max-width: none;
  }

  .toast {
    min-width: auto;
  }
}
</style>
