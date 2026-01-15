<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue && note" class="context-menu-overlay" @click.self="close">
        <div class="context-menu">
          <!-- Note Info Header -->
          <div class="context-menu-header">
            <h3 class="context-menu-title">{{ note.name || 'Untitled' }}</h3>
          </div>

          <!-- Actions -->
          <div class="context-menu-section">
            <button
              class="context-menu-item"
              data-action="open"
              @click="handleAction('open')"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Open Note</span>
            </button>
            <button
              class="context-menu-item context-menu-item--danger"
              @click="handleAction('delete')"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>

          <!-- Cancel Button -->
          <button class="context-menu-cancel" @click="close">
            Cancel
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Note } from '../types/notes'

interface Props {
  modelValue: boolean
  note: Note | null
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'open': []
  'delete': []
}>()

function handleAction(action: string): void {
  emit(action as any)
  close()
}

function close(): void {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}

.context-menu {
  background-color: white;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 500px;
  padding: 20px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 80vh;
  overflow-y: auto;
}

.context-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 8px;
}

.context-menu-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.context-menu-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 16px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
  transition: all 150ms;
  min-height: 44px;
}

.context-menu-item svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Open action - Amber */
.context-menu-item[data-action="open"] {
  color: #F59E0B;
}

.context-menu-item[data-action="open"]:active {
  background-color: rgba(245, 158, 11, 0.1);
  transform: scale(0.98);
}

.context-menu-item[data-action="open"] svg {
  color: #F59E0B;
}

/* Delete action - Red */
.context-menu-item--danger {
  color: #EF4444;
}

.context-menu-item--danger:active {
  background-color: rgba(239, 68, 68, 0.1);
  transform: scale(0.98);
}

.context-menu-item--danger svg {
  color: #EF4444;
}

.context-menu-cancel {
  margin-top: 8px;
  padding: 14px;
  border: none;
  background: #f3f4f6;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 150ms;
  min-height: 44px;
}

.context-menu-cancel:active {
  background-color: #e5e7eb;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .context-menu,
.modal-leave-active .context-menu {
  transition: transform 0.25s ease;
}

.modal-enter-from .context-menu,
.modal-leave-to .context-menu {
  transform: translateY(100%);
}

@media (min-width: 769px) {
  .context-menu-overlay {
    align-items: center;
  }

  .context-menu {
    border-radius: 16px;
    max-height: 90vh;
  }

  .modal-enter-from .context-menu,
  .modal-leave-to .context-menu {
    transform: scale(0.95);
  }
}

@media (prefers-reduced-motion: reduce) {
  .context-menu,
  .context-menu-item,
  .context-menu-cancel {
    transition: none !important;
    animation: none !important;
  }
}
</style>
