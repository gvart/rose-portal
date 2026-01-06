<template>
  <div class="day-view">
    <!-- All Day Events Section -->
    <div v-if="allDayEvents.length > 0" class="all-day-section">
      <div class="all-day-header">
        <span class="all-day-label">All Day</span>
      </div>
      <div class="all-day-events">
        <button
          v-for="event in allDayEvents"
          :key="event.id"
          v-haptic:light
          class="all-day-event"
          :class="getEventClasses(event)"
          @click="$emit('select-event', event)"
        >
          {{ event.eventName }}
        </button>
      </div>
    </div>

    <!-- Time Grid -->
    <div ref="gridRef" class="time-grid">
      <div class="time-grid-inner">
        <!-- Time Rows -->
        <div
          v-for="hour in hours"
          :key="hour"
          class="time-row"
        >
          <div class="time-gutter">
            <span class="time-label">{{ formatHour(hour) }}</span>
          </div>
          <div
            class="time-slot"
            :class="{ 'time-slot--past': isPastHour(hour) }"
            @click="handleTimeSlotClick(hour)"
          >
            <div class="time-slot-half time-slot-half--first" @click.stop="handleTimeSlotClick(hour, 0)"></div>
            <div class="time-slot-half time-slot-half--second" @click.stop="handleTimeSlotClick(hour, 30)"></div>
          </div>
        </div>

        <!-- Current Time Indicator -->
        <div
          v-if="isToday"
          class="current-time-indicator"
          :style="currentTimeIndicatorStyle"
        >
          <div class="current-time-label">{{ currentTimeLabel }}</div>
          <div class="current-time-dot"></div>
          <div class="current-time-line"></div>
        </div>

        <!-- Event Overlays -->
        <div
          v-for="event in timedEvents"
          :key="event.id"
          class="event-overlay"
          :class="getEventClasses(event)"
          :style="getEventStyle(event)"
          @click="$emit('select-event', event)"
        >
          <div class="event-content">
            <div class="event-header">
              <span class="event-name">{{ event.eventName }}</span>
            </div>
            <span class="event-time">{{ formatEventTimeRange(event) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State (as overlay but doesn't block interaction) -->
    <div v-if="events.length === 0" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
        <p class="empty-text">No events scheduled for this day</p>
        <button
          v-haptic:medium
          class="add-event-btn"
          @click="$emit('create-event', selectedDate)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Event
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { CalendarEvent } from '../types/calendar'
import { EVENT_COLORS } from '../types/calendar'

const props = defineProps<{
  selectedDate: Date
  events: CalendarEvent[]
}>()

const emit = defineEmits<{
  'select-event': [event: CalendarEvent]
  'create-event': [date: Date, time?: string]
}>()

// ============================================================================
// State
// ============================================================================

const gridRef = ref<HTMLElement | null>(null)
const now = ref(new Date())
let timeUpdateInterval: number | null = null

// Hour slots to display (6 AM to 11 PM)
const hours = Array.from({ length: 18 }, (_, i) => i + 6)

// ============================================================================
// Computed
// ============================================================================

/**
 * Check if selected date is today
 */
const isToday = computed(() => {
  const today = new Date()
  return isSameDay(props.selectedDate, today)
})

/**
 * All-day events
 */
const allDayEvents = computed(() => {
  return props.events.filter((event) => event.isAllDay)
})

/**
 * Timed events (not all-day)
 */
const timedEvents = computed(() => {
  return props.events.filter((event) => !event.isAllDay)
})

/**
 * Current time label (e.g., "2:30 PM")
 */
const currentTimeLabel = computed(() => {
  return now.value.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
})

/**
 * Style for current time indicator
 */
const currentTimeIndicatorStyle = computed(() => {
  const currentHour = now.value.getHours()
  const currentMinute = now.value.getMinutes()

  // Calculate position based on hour and minute
  const hourOffset = currentHour - 6 // Offset from start hour (6 AM)
  const minuteOffset = currentMinute / 60
  const totalOffset = hourOffset + minuteOffset

  const top = totalOffset * 80 // 80px per hour slot

  return {
    top: `${top}px`
  }
})

// ============================================================================
// Methods
// ============================================================================

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour} ${period}`
}

function formatEventTimeRange(event: CalendarEvent): string {
  const from = event.from.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  const to = event.to.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  return `${from} - ${to}`
}

function isPastHour(hour: number): boolean {
  if (!isToday.value) return false
  return hour < now.value.getHours()
}

function getEventClasses(event: CalendarEvent): Record<string, boolean> {
  const colorConfig = EVENT_COLORS[event.color]
  return {
    [colorConfig.bg]: true,
    [colorConfig.text]: true,
    [colorConfig.border]: true
  }
}

/**
 * Calculate event position and size on the grid
 */
function getEventStyle(event: CalendarEvent): Record<string, string> {
  const startHour = event.from.getHours()
  const startMinute = event.from.getMinutes()
  const endHour = event.to.getHours()
  const endMinute = event.to.getMinutes()

  // Calculate top position (offset from 6 AM)
  const hourOffset = startHour - 6
  const minuteOffset = startMinute / 60
  const top = (hourOffset + minuteOffset) * 80 // 80px per hour

  // Calculate height based on duration
  const durationHours = (endHour - startHour) + (endMinute - startMinute) / 60
  const height = Math.max(durationHours * 80, 30) // Minimum 30px

  return {
    position: 'absolute',
    top: `${top}px`,
    left: '80px',
    right: '8px',
    height: `${height}px`,
    zIndex: '10'
  }
}

function handleTimeSlotClick(hour: number, minute: number = 0) {
  const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  emit('create-event', props.selectedDate, timeStr)
}

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  // Update current time every minute
  timeUpdateInterval = window.setInterval(() => {
    now.value = new Date()
  }, 60000)

  // Scroll to current time on mount (or 8 AM if not today)
  if (gridRef.value) {
    const targetHour = isToday.value ? new Date().getHours() : 8
    const scrollTarget = Math.max(0, (targetHour - 7) * 80)
    gridRef.value.scrollTop = scrollTarget
  }
})

onUnmounted(() => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
  }
})
</script>

<style scoped>
.day-view {
  @apply h-full flex flex-col bg-white rounded-xl shadow-md overflow-hidden;
}

/* All Day Section */
.all-day-section {
  @apply flex border-b-2 border-gray-200 bg-gray-50;
}

.all-day-header {
  @apply w-[80px] flex-shrink-0 flex items-center justify-end pr-3
         border-r border-gray-200;
}

.all-day-label {
  @apply text-xs font-semibold text-gray-500 uppercase;
}

.all-day-events {
  @apply flex-1 flex flex-wrap gap-2 p-3;
}

.all-day-event {
  @apply px-3 py-1.5 text-sm font-medium rounded-lg border
         cursor-pointer hover:shadow-md transition-shadow;
}

/* Time Grid */
.time-grid {
  @apply flex-1 overflow-auto relative;
}

.time-grid-inner {
  @apply relative min-h-full;
}

/* Time Rows */
.time-row {
  @apply flex;
  height: 80px;
}

.time-gutter {
  @apply w-[80px] flex-shrink-0 flex items-start justify-end pr-3 pt-0
         border-r border-gray-200 bg-gray-50;
}

.time-label {
  @apply text-sm text-gray-500 font-medium -mt-2;
}

.time-slot {
  @apply flex-1 border-b border-gray-100 cursor-pointer
         hover:bg-gray-50 transition-colors relative;
}

.time-slot--past {
  @apply bg-gray-50/50;
}

.time-slot-half {
  @apply absolute left-0 right-0 h-1/2;
}

.time-slot-half--first {
  @apply top-0 border-b border-gray-100/50;
}

.time-slot-half--second {
  @apply bottom-0;
}

.time-slot-half:hover {
  @apply bg-indigo-50/50;
}

/* Current Time Indicator */
.current-time-indicator {
  @apply absolute left-0 right-0 flex items-center pointer-events-none;
  z-index: 20;
}

.current-time-label {
  @apply w-[80px] text-right pr-2 text-xs font-bold text-red-500;
}

.current-time-dot {
  @apply w-3 h-3 bg-red-500 rounded-full -ml-1.5;
}

.current-time-line {
  @apply flex-1 h-0.5 bg-red-500;
}

/* Event Overlays */
.event-overlay {
  @apply rounded-lg border-l-4 cursor-pointer overflow-hidden
         hover:shadow-lg transition-shadow;
}

.event-content {
  @apply p-3 h-full flex flex-col;
}

.event-header {
  @apply flex items-start justify-between gap-2;
}

.event-name {
  @apply font-semibold text-base leading-tight;
}

.event-time {
  @apply text-sm opacity-75 mt-1;
}

/* Empty State */
.empty-state {
  @apply fixed inset-0 flex items-center justify-center pointer-events-none;
  z-index: 5;
}

.empty-content {
  @apply flex flex-col items-center justify-center px-6 py-8
         bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg
         border-2 border-gray-200 pointer-events-auto max-w-sm;
}

.empty-icon {
  @apply w-16 h-16 text-gray-300 mb-4;
}

.empty-icon svg {
  @apply w-full h-full;
}

.empty-text {
  @apply text-lg text-gray-500 mb-6 text-center;
}

.add-event-btn {
  @apply flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white
         font-semibold rounded-lg hover:bg-indigo-700
         transition-all duration-150 active:scale-95 shadow-md;
  min-height: 48px;
}

/* Responsive */
@media (max-width: 768px) {
  .time-gutter,
  .all-day-header {
    @apply w-[60px];
  }

  .time-label {
    @apply text-xs;
  }

  .all-day-label {
    @apply text-[10px];
  }

  .time-row {
    height: 60px;
  }

  .event-overlay {
    left: 60px !important;
  }

  .event-content {
    @apply p-2;
  }

  .event-name {
    @apply text-sm;
  }

  .event-time {
    @apply text-xs;
  }

  .current-time-label {
    @apply w-[60px] text-[10px];
  }
}
</style>
