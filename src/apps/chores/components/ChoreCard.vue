<template>
  <div
    :class="['chore-card', { 'chore-card-draggable': draggable, 'chore-card-editable': canEdit }]"
    :draggable="draggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="handleClick"
  >
    <!-- Title and Priority -->
    <div class="chore-card-header">
      <h3 class="chore-card-title">{{ chore.title }}</h3>
      <PriorityBadge :priority="chore.priority" size="sm" />
    </div>

    <!-- Description -->
    <p v-if="chore.description" class="chore-card-description">
      {{ chore.description }}
    </p>

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

    <!-- Drag Handle (desktop only) -->
    <div v-if="draggable" class="chore-card-drag-handle">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 8h16M4 16h16"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PriorityBadge from './PriorityBadge.vue'
import type { Chore } from '../types/chores'
import { isOverdue, isDueSoon, formatDueDate, ChoreStatus } from '../types/chores'

interface Props {
  chore: Chore
  draggable: boolean
  canEdit: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
  dragstart: [event: DragEvent]
  dragend: [event: DragEvent]
}>()

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

function handleClick(): void {
  if (props.canEdit) {
    emit('click')
  }
}

function handleDragStart(event: DragEvent): void {
  if (props.draggable && event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('choreId', props.chore.id.toString())
    emit('dragstart', event)
  }
}

function handleDragEnd(event: DragEvent): void {
  emit('dragend', event)
}
</script>

<style scoped>
.chore-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  position: relative;
  transition: all 0.2s ease;
}

.chore-card-draggable {
  cursor: move;
}

.chore-card-editable {
  cursor: pointer;
}

.chore-card-draggable:hover,
.chore-card-editable:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.chore-card:active {
  transform: translateY(0);
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
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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

.chore-card-drag-handle {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.chore-card:hover .chore-card-drag-handle {
  opacity: 1;
}

@media (max-width: 768px) {
  .chore-card {
    padding: 0.875rem;
  }

  .chore-card-drag-handle {
    display: none;
  }
}
</style>
