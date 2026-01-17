<template>
  <q-card
    class="note-card"
    :class="{ 'note-card--selected': selected, 'note-card--long-press': isLongPressing }"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
    flat
    bordered
  >
    <q-card-section>
      <div class="note-card__header">
        <h3 class="note-card__title">{{ note.name || 'Untitled' }}</h3>
        <q-btn
          flat
          dense
          round
          icon="more_vert"
          color="grey-6"
          @click.stop="handleMenuClick"
          aria-label="Note options"
          class="menu-btn"
        />
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
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Note } from '../types/notes'
import TagChip from './TagChip.vue'

const props = defineProps<{
  note: Note
  selected: boolean
}>()

const emit = defineEmits<{
  click: []
  'long-press': []
  menu: []
}>()


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
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  border-radius: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.body--dark .note-card {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.note-card:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.body--dark .note-card:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.note-card--selected {
  background-color: rgba(139, 92, 246, 0.1);
  border-left: 3px solid #8b5cf6;
}

.body--dark .note-card--selected {
  background-color: rgba(139, 92, 246, 0.2);
}

.note-card--long-press {
  transform: scale(0.98);
  background-color: rgba(0, 0, 0, 0.05);
}

.body--dark .note-card--long-press {
  background-color: rgba(255, 255, 255, 0.08);
}

.note-card:deep(.q-card__section) {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  color: #1f2937;
}

.body--dark .note-card__title {
  color: #e2e8f0;
}

.menu-btn:active {
  transform: scale(1.05);
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

.body--dark .note-card__preview {
  color: #94a3b8;
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

.body--dark .note-card__date {
  color: #64748b;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .note-card,
  .menu-btn {
    transition: none !important;
  }
}
</style>
