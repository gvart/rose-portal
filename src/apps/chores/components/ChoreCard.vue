<template>
  <div
    ref="swipeContainer"
    class="chore-card-wrapper"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Swipe Background - Right (Move to next column) -->
    <div class="chore-card-swipe-bg-right" :style="{ opacity: rightSwipeOpacity }">
      <svg class="chore-card-swipe-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </div>

    <!-- Swipe Background - Left (Actions menu) -->
    <div class="chore-card-actions" :style="{ transform: `translateX(${Math.min(leftSwipeOffset, 0)}px)` }">
      <button v-if="canEdit" class="chore-card-action-btn chore-card-action-btn--edit" @click.stop="handleEdit">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>Edit</span>
      </button>
      <button class="chore-card-action-btn chore-card-action-btn--assign" @click.stop="handleAssign">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Assign</span>
      </button>
      <button v-if="canEdit" class="chore-card-action-btn chore-card-action-btn--delete" @click.stop="handleDelete">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>Delete</span>
      </button>
    </div>

    <!-- Card Content -->
    <div
      :class="['chore-card', { 'chore-card-editable': canEdit }]"
      :style="{
        transform: `translateX(${swipeOffset}px)`,
        '--priority-color': priorityColor
      }"
      @click="handleClick"
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
import { useSwipeActions } from '../composables/useSwipeActions'

interface Props {
  chore: Chore
  canEdit: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
  'swipe-move-next': []
  'swipe-edit': []
  'swipe-assign': []
  'swipe-delete': []
}>()

const swipeContainer = ref<HTMLElement | null>(null)
const swipeOffset = ref(0)
const leftSwipeOffset = ref(0)
const rightSwipeOpacity = ref(0)

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

// Check if mobile
const isMobile = computed(() => window.innerWidth < 768)

// Swipe actions setup
const {
  swipeOffset: swipeOffsetValue,
  direction,
  handleTouchStart: onTouchStart,
  handleTouchMove: onTouchMove,
  handleTouchEnd: onTouchEnd,
  reset: resetSwipe
} = useSwipeActions(swipeContainer, {
  thresholdRight: 80,
  thresholdLeft: 120,
  onSwipeRight: () => {
    emit('swipe-move-next')
    resetSwipe()
  },
  onSwipeLeft: () => {
    // Left swipe doesn't trigger action, just reveals buttons
  },
  hapticEnabled: true
})

// Touch handlers with mobile check
function handleTouchStart(event: TouchEvent): void {
  if (!isMobile.value) return
  onTouchStart(event)
}

function handleTouchMove(event: TouchEvent): void {
  if (!isMobile.value) return
  onTouchMove(event)

  // Update visual offset
  swipeOffset.value = swipeOffsetValue.value

  // Calculate opacity for right swipe background
  if (swipeOffsetValue.value > 0) {
    rightSwipeOpacity.value = Math.min(swipeOffsetValue.value / 80, 1)
    leftSwipeOffset.value = 0
  } else {
    rightSwipeOpacity.value = 0
    leftSwipeOffset.value = swipeOffsetValue.value
  }
}

function handleTouchEnd(event: TouchEvent): void {
  if (!isMobile.value) return
  onTouchEnd(event)

  // Animate back to original position
  setTimeout(() => {
    swipeOffset.value = 0
    leftSwipeOffset.value = 0
    rightSwipeOpacity.value = 0
  }, 100)
}

function handleClick(): void {
  if (props.canEdit) {
    emit('click')
  }
}

// Swipe action handlers
function handleEdit(): void {
  emit('swipe-edit')
}

function handleAssign(): void {
  emit('swipe-assign')
}

function handleDelete(): void {
  emit('swipe-delete')
}
</script>

<style scoped>
.chore-card-wrapper {
  position: relative;
  margin-bottom: 0.75rem;
  overflow: hidden;
}

/* Swipe backgrounds */
.chore-card-swipe-bg-right {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 80px;
  background: #D1FAE5; /* Light green */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  z-index: 0;
}

.chore-card-swipe-icon {
  width: 24px;
  height: 24px;
  color: #10B981; /* Green */
}

.chore-card-actions {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  z-index: 0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.chore-card-action-btn {
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: none;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 150ms;
  padding: 0;
}

.chore-card-action-btn svg {
  width: 20px;
  height: 20px;
}

.chore-card-action-btn:active {
  opacity: 0.8;
}

.chore-card-action-btn--edit {
  background: #3B82F6; /* Blue */
}

.chore-card-action-btn--assign {
  background: #EC4899; /* Pink */
}

.chore-card-action-btn--delete {
  background: #EF4444; /* Red */
}

/* Card */
.chore-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-left: 4px solid var(--priority-color);
  border-radius: 0.5rem;
  padding: 1rem;
  position: relative;
  transition: transform 200ms cubic-bezier(0.25, 1, 0.5, 1);
  z-index: 1;
}

.chore-card-editable {
  cursor: pointer;
}

.chore-card:active {
  transform: scale(0.98);
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

@media (max-width: 768px) {
  .chore-card {
    padding: 0.875rem;
  }
}

@media (min-width: 769px) {
  /* Disable swipe on desktop */
  .chore-card-swipe-bg-right,
  .chore-card-actions {
    display: none;
  }
}
</style>
