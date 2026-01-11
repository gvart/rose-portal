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
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* Week Header */
.week-header {
  display: flex;
  border-bottom: 2px solid var(--color-border-primary);
  background: var(--color-bg-secondary);
}

.time-gutter-header {
  width: 60px;
  flex-shrink: 0;
}

.day-column-header {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-3) 0;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.day-column-header:active {
  background: var(--color-bg-tertiary);
}

.day-column-header--today {
  background: var(--color-info-bg);
}

.day-column-header--today:active {
  background: var(--color-info-border);
}

.day-column-header--weekend {
  color: var(--color-text-muted);
}

.day-name {
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.day-date {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.day-date--today {
  background: var(--color-info-solid);
  color: white;
  border-radius: var(--radius-full);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* All Day Row */
.all-day-row {
  display: flex;
  border-bottom: 1px solid var(--color-border-primary);
  min-height: 40px;
}

.all-day-cell {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  padding: var(--space-1);
  border-left: 1px solid var(--color-border-primary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.all-day-cell:active {
  background: var(--color-bg-secondary);
}

.all-day-cell--today {
  background: var(--color-info-bg);
}

.all-day-event {
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-xs);
  border: 1px solid;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 100%;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.all-day-event:active {
  opacity: 0.8;
}

/* Time Grid */
.time-grid {
  flex: 1;
  overflow: auto;
  position: relative;
}

.time-grid-inner {
  position: relative;
  min-height: 100%;
}

/* Time Rows */
.time-row {
  display: flex;
  height: 60px;
}

.time-gutter {
  width: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-right: var(--space-2);
  padding-top: 0;
  border-right: 1px solid var(--color-border-primary);
  background: var(--color-bg-secondary);
}

.time-label {
  font-size: var(--font-size-12);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  margin-top: -8px;
}

.time-cell {
  flex: 1;
  border-bottom: 1px solid var(--color-border-primary);
  border-left: 1px solid var(--color-border-primary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.time-cell:active {
  background: var(--color-bg-secondary);
}

.time-cell--today {
  background: var(--color-info-bg);
}

.time-cell--weekend {
  background: var(--color-bg-secondary);
}

/* Current Time Indicator */
.current-time-indicator {
  position: absolute;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 20;
}

.current-time-dot {
  width: 12px;
  height: 12px;
  background: var(--color-error);
  border-radius: var(--radius-full);
  margin-left: -6px;
}

.current-time-line {
  flex: 1;
  height: 2px;
  background: var(--color-error);
}

/* Event Overlays */
.event-overlay {
  border-radius: var(--radius-xs);
  border: 1px solid;
  cursor: pointer;
  overflow: hidden;
  transition: all var(--duration-fast) var(--ease-in-out);
  margin: 0 2px;
}

.event-overlay:active {
  box-shadow: var(--depth-2-shadow);
}

.event-content {
  padding: var(--space-1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-time {
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  opacity: 0.75;
}

.event-name {
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 768px) {
  .time-gutter-header,
  .time-gutter {
    width: 50px;
  }

  .day-name {
    font-size: 10px;
  }

  .day-date {
    font-size: var(--font-size-14);
  }

  .day-date--today {
    width: 24px;
    height: 24px;
    font-size: var(--font-size-12);
  }

  .time-label {
    font-size: 10px;
  }

  .time-row {
    height: 50px;
  }

  .event-time {
    display: none;
  }

  .event-name {
    font-size: 10px;
  }
}
</style>
