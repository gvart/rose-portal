<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay">
        <div class="modal-container">
          <UserSelection
            @select-user="handleSelectUser"
            @new-user="handleNewUser"
            @sign-in="handleSignIn"
            @remove-user="handleRemoveUser"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import UserSelection from './UserSelection.vue'
import type { StoredUser } from '@/types/auth'

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'select-user': [user: StoredUser]
  'new-user': []
  'sign-in': []
  'remove-user': [user: StoredUser]
}>()

function handleSelectUser(user: StoredUser): void {
  emit('select-user', user)
}

function handleNewUser(): void {
  emit('new-user')
}

function handleSignIn(): void {
  emit('sign-in')
}

function handleRemoveUser(user: StoredUser): void {
  emit('remove-user', user)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: var(--space-4);
}

.modal-container {
  width: 100%;
  max-width: 600px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: var(--depth-3-border);
  box-shadow: var(--depth-3-shadow);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-slow) var(--ease-in-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(var(--space-4));
}
</style>
