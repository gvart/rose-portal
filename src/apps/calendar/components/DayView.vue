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
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--depth-2-shadow);
  overflow: hidden;
}

/* All Day Section */
.all-day-section {
  display: flex;
  border-bottom: 2px solid var(--color-border-primary);
  background: var(--color-bg-secondary);
}

.all-day-header {
  width: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: var(--space-3);
  border-right: 1px solid var(--color-border-primary);
}

.all-day-label {
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.all-day-events {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-3);
}

.all-day-event {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  border: 1px solid;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.all-day-event:active {
  box-shadow: var(--depth-2-shadow);
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
  height: 80px;
}

.time-gutter {
  width: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-right: var(--space-3);
  padding-top: 0;
  border-right: 1px solid var(--color-border-primary);
  background: var(--color-bg-secondary);
}

.time-label {
  font-size: var(--font-size-14);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  margin-top: -8px;
}

.time-slot {
  flex: 1;
  border-bottom: 1px solid var(--color-border-primary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  position: relative;
}

.time-slot:active {
  background: var(--color-bg-secondary);
}

.time-slot--past {
  background: var(--color-bg-secondary);
  opacity: 0.5;
}

.time-slot-half {
  position: absolute;
  left: 0;
  right: 0;
  height: 50%;
}

.time-slot-half--first {
  top: 0;
  border-bottom: 1px solid var(--color-border-primary);
  opacity: 0.5;
}

.time-slot-half--second {
  bottom: 0;
}

.time-slot-half:active {
  background: var(--color-info-bg);
}

/* Current Time Indicator */
.current-time-indicator {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 20;
}

.current-time-label {
  width: 80px;
  text-align: right;
  padding-right: var(--space-2);
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  color: var(--color-error);
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
  border-radius: var(--radius-md);
  border-left: 4px solid;
  cursor: pointer;
  overflow: hidden;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.event-overlay:active {
  box-shadow: var(--depth-3-shadow);
}

.event-content {
  padding: var(--space-3);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}

.event-name {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-16);
  line-height: 1.25;
}

.event-time {
  font-size: var(--font-size-14);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  opacity: 0.75;
  margin-top: var(--space-1);
}

/* Empty State */
.empty-state {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 5;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-6);
  background: var(--color-bg-primary);
  border: var(--depth-2-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--depth-3-shadow);
  pointer-events: auto;
  max-width: 448px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--color-text-faint);
  margin-bottom: var(--space-4);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-text {
  font-size: var(--font-size-18);
  color: var(--color-text-muted);
  margin-bottom: var(--space-6);
  text-align: center;
}

.add-event-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  background: var(--color-info-solid);
  color: white;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  box-shadow: var(--depth-2-shadow);
  min-height: 48px;
}

.add-event-btn:active {
  transform: scale(0.95);
  background: #4f46e5;
}

/* Responsive */
@media (max-width: 768px) {
  .time-gutter,
  .all-day-header {
    width: 60px;
  }

  .time-label {
    font-size: var(--font-size-12);
  }

  .all-day-label {
    font-size: 10px;
  }

  .time-row {
    height: 60px;
  }

  .event-overlay {
    left: 60px !important;
  }

  .event-content {
    padding: var(--space-2);
  }

  .event-name {
    font-size: var(--font-size-14);
  }

  .event-time {
    font-size: var(--font-size-12);
  }

  .current-time-label {
    width: 60px;
    font-size: 10px;
  }
}
</style>
