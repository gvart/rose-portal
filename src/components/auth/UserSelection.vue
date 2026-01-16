<template>
  <div class="user-selection">
    <h3 class="selection-title">{{ sortedUsers.length > 0 ? 'Welcome Back' : 'Welcome to ROSE' }}</h3>
    <p class="selection-subtitle">{{ sortedUsers.length > 0 ? 'Select your profile or sign in' : 'Create an account or sign in to get started' }}</p>

    <div v-if="sortedUsers.length > 0" class="user-list">
      <button
        v-for="user in sortedUsers"
        :key="user.id"
       
        class="user-card"
        @click="selectUser(user)"
        @touchstart="handleTouchStart(user)"
        @touchend="handleTouchEnd"
        @touchcancel="handleTouchEnd"
        @contextmenu.prevent="handleLongPress(user)"
      >
        <div class="user-avatar">
          {{ getUserInitial(user.username) }}
        </div>
        <div class="user-info">
          <div class="user-name">{{ user.username }}</div>
          <div class="user-last-login">Last login: {{ formatLastLogin(user.lastLoginAt) }}</div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="chevron-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>

    <div class="action-buttons" :class="{ 'no-users': sortedUsers.length === 0 }">
      <button
       
        class="btn-secondary"
        @click="$emit('new-user')"
      >
        Create New User
      </button>
      <button
       
        class="btn-secondary"
        @click="$emit('sign-in')"
      >
        Sign In with Existing Account
      </button>
    </div>

    <!-- Confirmation dialog for removing user -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="userToRemove" class="modal-overlay" @click="cancelRemove">
          <div class="confirmation-dialog" @click.stop>
            <h3 class="dialog-title">Remove User</h3>
            <p class="dialog-message">
              Remove {{ userToRemove.username }} from this device?
            </p>
            <div class="dialog-buttons">
              <button class="btn-cancel" @click="cancelRemove">
                Cancel
              </button>
              <button class="btn-confirm" @click="confirmRemove">
                Remove
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMultiUserAuth } from '@/composables/useMultiUserAuth'
import { useHapticFeedback } from '@/composables/useHapticFeedback'
import type { StoredUser } from '@/types/auth'

const emit = defineEmits<{
  'select-user': [user: StoredUser]
  'new-user': []
  'sign-in': []
  'remove-user': [user: StoredUser]
}>()

const { sortedUsers, removeUser } = useMultiUserAuth()
const { vibrate } = useHapticFeedback()

const userToRemove = ref<StoredUser | null>(null)
let longPressTimer: ReturnType<typeof setTimeout> | null = null
let longPressTriggered = false

function selectUser(user: StoredUser): void {
  // Only select if long press wasn't triggered
  if (!longPressTriggered) {
    emit('select-user', user)
  }
}

function handleTouchStart(user: StoredUser): void {
  longPressTriggered = false
  longPressTimer = setTimeout(() => {
    longPressTriggered = true
    handleLongPress(user)
  }, 500) // 500ms for long press
}

function handleTouchEnd(): void {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
  // Reset after a short delay to prevent immediate click
  setTimeout(() => {
    longPressTriggered = false
  }, 100)
}

function handleLongPress(user: StoredUser): void {
  vibrate('medium')
  userToRemove.value = user
}

function cancelRemove(): void {
  userToRemove.value = null
}

function confirmRemove(): void {
  if (userToRemove.value) {
    removeUser(userToRemove.value.id)
    emit('remove-user', userToRemove.value)
    vibrate('heavy')
    userToRemove.value = null
  }
}

function getUserInitial(username: string): string {
  return username.charAt(0).toUpperCase()
}

function formatLastLogin(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.user-selection {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
  max-width: 600px;
  margin: 0 auto;
}

.selection-title {
  font-size: var(--font-size-32);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
  text-align: center;
}

.selection-subtitle {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  text-align: center;
  margin-top: calc(-1 * var(--space-4));
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.user-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.user-card:active {
  transform: scale(0.98);
  background: var(--color-bg-secondary);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-20);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  text-align: left;
}

.user-name {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.user-last-login {
  font-size: var(--font-size-13);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.chevron-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-faint);
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.action-buttons.no-users {
  margin-top: 0;
}

.btn-secondary {
  width: 100%;
  padding: var(--space-3) var(--space-6);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-14);
  border: var(--depth-1-border);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.btn-secondary:active {
  transform: scale(0.98);
  background: var(--color-bg-tertiary);
}

/* Confirmation dialog */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  padding: var(--space-4);
}

.confirmation-dialog {
  width: 100%;
  max-width: 320px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: var(--depth-3-border);
  box-shadow: var(--depth-3-shadow);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.dialog-title {
  font-size: var(--font-size-20);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-align: center;
}

.dialog-message {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  text-align: center;
}

.dialog-buttons {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: var(--space-3);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-14);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.btn-cancel {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: var(--depth-1-border);
}

.btn-cancel:active {
  transform: scale(0.98);
  background: var(--color-bg-tertiary);
}

.btn-confirm {
  background: #ef4444;
  color: white;
  border: none;
}

.btn-confirm:active {
  transform: scale(0.98);
  background: #dc2626;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-slow) var(--ease-in-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .confirmation-dialog,
.modal-leave-to .confirmation-dialog {
  transform: scale(0.95);
}
</style>
