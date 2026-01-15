<template>
  <div
    class="chore-card-wrapper"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
    @click="handleClick"
  >
    <div
      :class="['chore-card', { 'chore-card-long-press': isLongPressing }]"
      :style="{ '--priority-color': priorityColor }"
    >
      <!-- Title and Priority -->
      <div class="chore-card-header">
        <h3 class="chore-card-title">{{ chore.title }}</h3>
        <PriorityBadge :priority="chore.priority" size="sm" />
      </div>

      <!-- Description with Markdown -->
      <MarkdownRenderer
        v-if="chore.description"
        class="chore-card-description"
        :markdown="chore.description"
        :max-lines="2"
      />

      <!-- Due Date with Visual Warnings -->
      <div class="chore-card-meta">
        <div v-if="overdueStatus" :class="['chore-card-due', overdueStatus.class]">
          <svg
            class="chore-card-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ overdueStatus.text }}</span>
        </div>

        <!-- Assigned User -->
        <div class="chore-card-assignee">
          <svg
            class="chore-card-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>{{ chore.assignedTo?.username || 'Unassigned' }}</span>
        </div>
      </div>

      <!-- Completion Info (DONE only) -->
      <div v-if="chore.completedAt && chore.completedBy" class="chore-card-completion">
        <svg
          class="chore-card-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          Completed by {{ chore.completedBy.username }} on {{ formatCompletedDate }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PriorityBadge from './PriorityBadge.vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import type { Chore } from '../types/chores'
import { isOverdue, isDueSoon, formatDueDate, ChoreStatus, PRIORITY_CONFIGS } from '../types/chores'
import { useHapticFeedback } from '@/composables/useHapticFeedback'

interface Props {
  chore: Chore
  canEdit: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
  'long-press': []
}>()

const { vibrate } = useHapticFeedback()

const isLongPressing = ref(false)
let longPressTimer: NodeJS.Timeout | null = null
let startX = 0
let startY = 0
const LONG_PRESS_DURATION = 500 // ms
const MOVEMENT_THRESHOLD = 10 // px

// Priority color for left border
const priorityColor = computed(() => {
  return PRIORITY_CONFIGS[props.chore.priority].color
})

const overdueStatus = computed(() => {
  if (props.chore.status === ChoreStatus.DONE) {
    return null
  }

  if (isOverdue(props.chore)) {
    return {
      text: `Overdue - ${formatDueDate(props.chore.dueDate)}`,
      class: 'chore-card-due-overdue'
    }
  }

  if (isDueSoon(props.chore)) {
    return {
      text: `Due soon - ${formatDueDate(props.chore.dueDate)}`,
      class: 'chore-card-due-soon'
    }
  }

  return {
    text: `Due ${formatDueDate(props.chore.dueDate)}`,
    class: 'chore-card-due-normal'
  }
})

const formatCompletedDate = computed(() => {
  if (!props.chore.completedAt) return ''
  return props.chore.completedAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
})

function handleTouchStart(event: TouchEvent): void {
  const touch = event.touches[0]
  startX = touch.clientX
  startY = touch.clientY

  // Start long press timer
  longPressTimer = setTimeout(() => {
    isLongPressing.value = true
    vibrate('medium')
    emit('long-press')
  }, LONG_PRESS_DURATION)
}

function handleTouchMove(event: TouchEvent): void {
  if (!longPressTimer) return

  const touch = event.touches[0]
  const deltaX = Math.abs(touch.clientX - startX)
  const deltaY = Math.abs(touch.clientY - startY)

  // Cancel long press if user moves finger too much
  if (deltaX > MOVEMENT_THRESHOLD || deltaY > MOVEMENT_THRESHOLD) {
    cancelLongPress()
  }
}

function handleTouchEnd(): void {
  cancelLongPress()
}

function handleTouchCancel(): void {
  cancelLongPress()
}

function cancelLongPress(): void {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
  isLongPressing.value = false
}

function handleClick(): void {
  // Don't emit click if it was a long press
  if (isLongPressing.value) {
    return
  }

  if (props.canEdit) {
    emit('click')
  }
}
</script>

<style scoped>
.chore-card-wrapper {
  position: relative;
  margin-bottom: 0.75rem;
  user-select: none;
  -webkit-user-select: none;
  max-width: 100%;
  overflow: hidden;
}

.chore-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-left: 4px solid var(--priority-color);
  border-radius: 0.5rem;
  padding: 1rem;
  position: relative;
  transition: box-shadow 150ms ease;
  will-change: transform;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.chore-card:active {
  transform: scale(0.98);
}

.chore-card-long-press {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.chore-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.chore-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.chore-card-description {
  margin: 0 0 0.75rem 0;
}

.chore-card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.chore-card-due,
.chore-card-assignee {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
}

.chore-card-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.chore-card-due-overdue {
  color: #dc2626;
  font-weight: 600;
}

.chore-card-due-soon {
  color: #f59e0b;
  font-weight: 600;
}

.chore-card-due-normal {
  color: #6b7280;
}

.chore-card-assignee {
  color: #6b7280;
}

.chore-card-completion {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #10b981;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

/* Desktop - show drag cursor */
@media (min-width: 769px) {
  .chore-card-wrapper:hover .chore-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .chore-card {
    cursor: grab;
  }

  .chore-card:active {
    cursor: grabbing;
  }
}

@media (max-width: 768px) {
  .chore-card-wrapper {
    cursor: pointer;
  }

  .chore-card {
    padding: 0.875rem;
    cursor: pointer;
  }
}
</style>
