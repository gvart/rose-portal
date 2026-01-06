<template>
  <div class="week-view">
    <!-- Day Headers -->
    <div class="week-header">
      <div class="time-gutter-header"></div>
      <div
        v-for="day in weekDays"
        :key="day.date.toISOString()"
        class="day-column-header"
        :class="{
          'day-column-header--today': day.isToday,
          'day-column-header--weekend': day.isWeekend
        }"
        @click="$emit('select-day', day.date)"
      >
        <span class="day-name">{{ day.dayOfWeek }}</span>
        <span class="day-date" :class="{ 'day-date--today': day.isToday }">
          {{ day.dayOfMonth }}
        </span>
      </div>
    </div>

    <!-- All Day Events Row -->
    <div class="all-day-row">
      <div class="time-gutter">
        <span class="time-label">All Day</span>
      </div>
      <div
        v-for="day in weekDays"
        :key="`allday-${day.date.toISOString()}`"
        class="all-day-cell"
        :class="{ 'all-day-cell--today': day.isToday }"
        @click="handleAllDayClick(day.date)"
      >
        <button
          v-for="event in day.allDayEvents"
          :key="event.id"
          v-haptic:light
          class="all-day-event"
          :class="getEventClasses(event)"
          @click.stop="$emit('select-event', event)"
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
            v-for="day in weekDays"
            :key="`${hour}-${day.date.toISOString()}`"
            class="time-cell"
            :class="{
              'time-cell--today': day.isToday,
              'time-cell--weekend': day.isWeekend
            }"
            @click="handleTimeCellClick(day.date, hour)"
          >
          </div>
        </div>

        <!-- Current Time Indicator -->
        <div
          v-if="showCurrentTimeIndicator"
          class="current-time-indicator"
          :style="currentTimeIndicatorStyle"
        >
          <div class="current-time-dot"></div>
          <div class="current-time-line"></div>
        </div>

        <!-- Event Overlays -->
        <div
          v-for="(event, index) in positionedEvents"
          :key="event.id"
          class="event-overlay"
          :class="getEventClasses(event)"
          :style="getEventStyle(event)"
          @click="$emit('select-event', event)"
        >
          <div class="event-content">
            <span class="event-time">{{ formatEventTime(event) }}</span>
            <span class="event-name">{{ event.eventName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { CalendarEvent, DayColumn } from '../types/calendar'
import { EVENT_COLORS } from '../types/calendar'

const props = defineProps<{
  selectedDate: Date
  events: CalendarEvent[]
}>()

const emit = defineEmits<{
  'select-day': [date: Date]
  'select-event': [event: CalendarEvent]
  'create-event': [date: Date, time?: string]
}>()

// ============================================================================
// State
// ============================================================================

const gridRef = ref<HTMLElement | null>(null)
const now = ref(new Date())
let timeUpdateInterval: number | null = null

// Hour slots to display (6 AM to 10 PM)
const hours = Array.from({ length: 17 }, (_, i) => i + 6)

// ============================================================================
// Computed
// ============================================================================

/**
 * Generate week day columns
 */
const weekDays = computed<DayColumn[]>(() => {
  const startOfWeek = getStartOfWeek(props.selectedDate)
  const today = new Date()
  const days: DayColumn[] = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(date.getDate() + i)

    const dayOfWeek = date.getDay()
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    days.push({
      date,
      dayOfWeek: dayNames[dayOfWeek],
      dayOfMonth: date.getDate(),
      isToday: isSameDay(date, today),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      timeSlots: [],
      allDayEvents: getAllDayEventsForDate(date)
    })
  }

  return days
})

/**
 * Non-all-day events positioned for the grid
 */
const positionedEvents = computed(() => {
  return props.events.filter((event) => !event.isAllDay)
})

/**
 * Should show current time indicator
 */
const showCurrentTimeIndicator = computed(() => {
  const today = new Date()
  return weekDays.value.some((day) => isSameDay(day.date, today))
})

/**
 * Style for current time indicator
 */
const currentTimeIndicatorStyle = computed(() => {
  const today = new Date()
  const todayIndex = weekDays.value.findIndex((day) => isSameDay(day.date, today))

  if (todayIndex === -1) return { display: 'none' }

  const currentHour = now.value.getHours()
  const currentMinute = now.value.getMinutes()

  // Calculate position based on hour and minute
  const hourOffset = currentHour - 6 // Offset from start hour (6 AM)
  const minuteOffset = currentMinute / 60
  const totalOffset = hourOffset + minuteOffset

  const top = totalOffset * 60 // 60px per hour slot
  const left = `calc(60px + ${(todayIndex / 7) * 100}%)`

  return {
    top: `${top}px`,
    left,
    width: `calc(100% / 7)`
  }
})

// ============================================================================
// Methods
// ============================================================================

function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getAllDayEventsForDate(date: Date): CalendarEvent[] {
  return props.events.filter((event) => {
    if (!event.isAllDay) return false

    const eventStart = new Date(event.from)
    const eventEnd = new Date(event.to)

    return (
      isSameDay(eventStart, date) ||
      isSameDay(eventEnd, date) ||
      (eventStart < date && eventEnd > date)
    )
  })
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour} ${period}`
}

function formatEventTime(event: CalendarEvent): string {
  return event.from.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
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

  // Find which day column this event belongs to
  const dayIndex = weekDays.value.findIndex((day) =>
    isSameDay(day.date, event.from)
  )

  if (dayIndex === -1) {
    return { display: 'none' }
  }

  // Calculate top position (offset from 6 AM)
  const hourOffset = startHour - 6
  const minuteOffset = startMinute / 60
  const top = (hourOffset + minuteOffset) * 60 // 60px per hour

  // Calculate height based on duration
  const durationHours = (endHour - startHour) + (endMinute - startMinute) / 60
  const height = Math.max(durationHours * 60, 20) // Minimum 20px

  // Calculate left position and width (accounting for time gutter)
  const columnWidth = `calc((100% - 60px) / 7)`
  const left = `calc(60px + (${dayIndex} * ${columnWidth}))`

  return {
    position: 'absolute',
    top: `${top}px`,
    left,
    width: columnWidth,
    height: `${height}px`,
    zIndex: '10'
  }
}

function handleTimeCellClick(date: Date, hour: number) {
  const timeStr = `${hour.toString().padStart(2, '0')}:00`
  emit('create-event', date, timeStr)
}

function handleAllDayClick(date: Date) {
  emit('create-event', date)
}

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  // Update current time every minute
  timeUpdateInterval = window.setInterval(() => {
    now.value = new Date()
  }, 60000)

  // Scroll to current time on mount
  if (gridRef.value) {
    const currentHour = new Date().getHours()
    const scrollTarget = Math.max(0, (currentHour - 7) * 60)
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
.week-view {
  @apply h-full flex flex-col bg-white rounded-xl shadow-md overflow-hidden;
}

/* Week Header */
.week-header {
  @apply flex border-b-2 border-gray-200 bg-gray-50;
}

.time-gutter-header {
  @apply w-[60px] flex-shrink-0;
}

.day-column-header {
  @apply flex-1 flex flex-col items-center py-3 cursor-pointer
         transition-colors hover:bg-gray-100;
}

.day-column-header--today {
  @apply bg-indigo-50 hover:bg-indigo-100;
}

.day-column-header--weekend {
  @apply text-gray-500;
}

.day-name {
  @apply text-xs font-medium text-gray-500 uppercase;
}

.day-date {
  @apply text-lg font-bold text-gray-800;
}

.day-date--today {
  @apply bg-indigo-600 text-white rounded-full w-8 h-8
         flex items-center justify-center;
}

/* All Day Row */
.all-day-row {
  @apply flex border-b border-gray-200 min-h-[40px];
}

.all-day-cell {
  @apply flex-1 flex flex-wrap gap-1 p-1 border-l border-gray-100
         cursor-pointer hover:bg-gray-50 transition-colors;
}

.all-day-cell--today {
  @apply bg-indigo-50/50;
}

.all-day-event {
  @apply px-2 py-0.5 text-xs font-medium rounded border truncate
         max-w-full cursor-pointer hover:opacity-80 transition-opacity;
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
  height: 60px;
}

.time-gutter {
  @apply w-[60px] flex-shrink-0 flex items-start justify-end pr-2 pt-0
         border-r border-gray-200 bg-gray-50;
}

.time-label {
  @apply text-xs text-gray-500 font-medium -mt-2;
}

.time-cell {
  @apply flex-1 border-b border-l border-gray-100
         cursor-pointer hover:bg-gray-50 transition-colors;
}

.time-cell--today {
  @apply bg-indigo-50/30;
}

.time-cell--weekend {
  @apply bg-gray-50/50;
}

/* Current Time Indicator */
.current-time-indicator {
  @apply absolute flex items-center pointer-events-none;
  z-index: 20;
}

.current-time-dot {
  @apply w-3 h-3 bg-red-500 rounded-full -ml-1.5;
}

.current-time-line {
  @apply flex-1 h-0.5 bg-red-500;
}

/* Event Overlays */
.event-overlay {
  @apply rounded border cursor-pointer overflow-hidden
         hover:shadow-md transition-shadow;
  margin: 0 2px;
}

.event-content {
  @apply p-1 h-full flex flex-col;
}

.event-time {
  @apply text-[10px] font-semibold opacity-75;
}

.event-name {
  @apply text-xs font-medium truncate;
}

/* Responsive */
@media (max-width: 768px) {
  .time-gutter-header,
  .time-gutter {
    @apply w-[50px];
  }

  .day-name {
    @apply text-[10px];
  }

  .day-date {
    @apply text-sm;
  }

  .day-date--today {
    @apply w-6 h-6 text-xs;
  }

  .time-label {
    @apply text-[10px];
  }

  .time-row {
    height: 50px;
  }

  .event-time {
    @apply hidden;
  }

  .event-name {
    @apply text-[10px];
  }
}
</style>
