<template>
  <div
    class="note-card"
    :class="{ 'note-card--selected': selected, 'note-card--long-press': isLongPressing }"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
  >
    <div class="note-card__content">
      <div class="note-card__header">
        <h3 class="note-card__title">{{ note.name || 'Untitled' }}</h3>
        <button
          class="menu-btn"
          @click.stop="handleMenuClick"
          title="Note options"
          aria-label="Note options"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <p v-if="notePreview" class="note-card__preview">
        {{ notePreview }}
      </p>

      <div class="note-card__footer">
        <div v-if="note.tags.length > 0" class="note-card__tags">
          <TagChip v-for="tag in note.tags" :key="tag.id" :tag="tag" :filled="true" />
        </div>
        <span class="note-card__date">{{ formattedDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Note } from '../types/notes'
import TagChip from './TagChip.vue'
import { useHapticFeedback } from '@/composables/useHapticFeedback'

const props = defineProps<{
  note: Note
  selected: boolean
}>()

const emit = defineEmits<{
  click: []
  'long-press': []
  menu: []
}>()

const { vibrate } = useHapticFeedback()

// Long press detection
const LONG_PRESS_DURATION = 500 // ms
const MOVEMENT_THRESHOLD = 10 // px

const isLongPressing = ref(false)
let longPressTimer: NodeJS.Timeout | null = null
let touchStartPos = { x: 0, y: 0 }
let longPressTriggered = false

function handleTouchStart(event: TouchEvent) {
  if (event.touches.length !== 1) return

  const touch = event.touches[0]
  touchStartPos = { x: touch.clientX, y: touch.clientY }
  longPressTriggered = false
  isLongPressing.value = true

  longPressTimer = setTimeout(() => {
    if (isLongPressing.value) {
      longPressTriggered = true
      vibrate('medium')
      emit('long-press')
    }
  }, LONG_PRESS_DURATION)
}

function handleTouchMove(event: TouchEvent) {
  if (!longPressTimer) return
  if (event.touches.length !== 1) return

  const touch = event.touches[0]
  const deltaX = Math.abs(touch.clientX - touchStartPos.x)
  const deltaY = Math.abs(touch.clientY - touchStartPos.y)

  // Cancel long press if finger moved too much
  if (deltaX > MOVEMENT_THRESHOLD || deltaY > MOVEMENT_THRESHOLD) {
    cancelLongPress()
  }
}

function handleTouchEnd(event: TouchEvent) {
  cancelLongPress()

  // If long press was triggered, don't emit click
  if (longPressTriggered) {
    event.preventDefault()
  }
}

function handleTouchCancel() {
  cancelLongPress()
}

function cancelLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
  isLongPressing.value = false
}

function handleClick() {
  if (!longPressTriggered) {
    emit('click')
  }
}

function handleMenuClick() {
  emit('menu')
}

// Content preview - extract first ~80 chars without markdown
const notePreview = computed(() => {
  const content = props.note.content.slice(0, 100)
  const plainText = content
    .replace(/[#*_`~\[\]()]/g, '') // Remove markdown
    .trim()
  const preview = plainText.slice(0, 80)
  return preview.length > 0 ? (plainText.length > 80 ? preview + '...' : preview) : ''
})

const formattedDate = computed(() => {
  const date = props.note.updatedAt
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes === 0 ? 'Just now' : `${minutes}m ago`
    }
    return `${hours}h ago`
  }

  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`

  // Format as date
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})
</script>

<style scoped>
.note-card {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.note-card:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.note-card--selected {
  background-color: rgba(139, 92, 246, 0.1);
  border-left: 3px solid #8b5cf6;
}

.note-card--long-press {
  transform: scale(0.98);
  background-color: rgba(0, 0, 0, 0.05);
}

.note-card__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.note-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.note-card__title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.menu-btn:hover,
.menu-btn:active {
  background-color: rgba(0, 0, 0, 0.05);
  color: #4b5563;
  transform: scale(1.05);
}

.menu-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.note-card__preview {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 4px 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.note-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.note-card__date {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Remove default focus outline */
.note-card:focus,
.menu-btn:focus {
  outline: none;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .note-card,
  .menu-btn {
    transition: none !important;
  }
}
</style>
