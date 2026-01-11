<template>
  <div class="month-view">
    <!-- Day Headers -->
    <div class="day-headers">
      <div
        v-for="day in dayHeaders"
        :key="day"
        class="day-header"
        :class="{ 'day-header--weekend': day === 'Sun' || day === 'Sat' }"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid" role="grid" aria-label="Calendar month view">
      <button
        v-for="cell in calendarCells"
        :key="cell.date.toISOString()"
        v-haptic:light
        role="gridcell"
        class="day-cell"
        :class="getDayCellClasses(cell)"
        @click="handleDayClick(cell)"
        :aria-label="getAriaLabel(cell)"
      >
        <!-- Day Number -->
        <span class="day-number">{{ cell.dayOfMonth }}</span>

        <!-- Events (Desktop) -->
        <div class="events-container desktop-events">
          <div
            v-for="event in cell.events.slice(0, maxVisibleEvents)"
            :key="event.id"
            class="event-pill"
            :class="getEventClasses(event)"
            @click.stop="$emit('select-event', event)"
          >
            <span class="event-time">{{ formatEventTime(event) }}</span>
            <span class="event-name">{{ event.eventName }}</span>
          </div>

          <!-- More indicator -->
          <div
            v-if="cell.events.length > maxVisibleEvents"
            class="more-events"
          >
            +{{ cell.events.length - maxVisibleEvents }} more
          </div>
        </div>

        <!-- Event Dots (Mobile) -->
        <div class="events-container mobile-events">
          <div
            v-for="event in cell.events.slice(0, 3)"
            :key="event.id"
            class="event-dot"
            :class="getEventDotClass(event)"
          ></div>
        </div>
      </button>
    </div>

    <!-- Mobile: Selected Day Events Panel -->
    <Transition name="slide-up">
      <div v-if="showMobileEventsPanel" class="mobile-events-panel">
        <div class="panel-header">
          <h3 class="panel-title">{{ formatSelectedDate }}</h3>
          <button
            v-haptic:light
            class="panel-close"
            aria-label="Close events panel"
            @click="showMobileEventsPanel = false"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="panel-content">
          <div v-if="selectedDayEvents.length === 0" class="no-events">
            <p>No events scheduled</p>
            <button
              v-haptic:medium
              class="add-event-btn"
              @click="$emit('create-event', selectedDate)"
            >
              Add Event
            </button>
          </div>

          <div v-else class="events-list">
            <button
              v-for="event in selectedDayEvents"
              :key="event.id"
              v-haptic:light
              class="event-item"
              :class="getEventClasses(event)"
              @click="$emit('select-event', event)"
            >
              <span class="event-time-full">{{ formatEventTimeRange(event) }}</span>
              <span class="event-name-full">{{ event.eventName }}</span>
            </button>

            <button
              v-haptic:medium
              class="add-event-btn add-event-btn--inline"
              @click="$emit('create-event', selectedDate)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Event
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CalendarEvent, DayCell } from '../types/calendar'
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

const showMobileEventsPanel = ref(false)
const maxVisibleEvents = 3

// ============================================================================
// Computed
// ============================================================================

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Generate all calendar cells for the current month view
 * Includes overflow days from previous/next months
 */
const calendarCells = computed<DayCell[]>(() => {
  const cells: DayCell[] = []
  const today = new Date()
  const year = props.selectedDate.getFullYear()
  const month = props.selectedDate.getMonth()

  // First day of the month
  const firstDay = new Date(year, month, 1)
  const startDayOfWeek = firstDay.getDay()

  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  // Days from previous month
  const prevMonth = new Date(year, month, 0)
  const daysInPrevMonth = prevMonth.getDate()

  // Add days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = new Date(year, month - 1, day)
    cells.push(createDayCell(date, day, false))
  }

  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    cells.push(createDayCell(date, day, true))
  }

  // Add days from next month to complete the grid (6 rows)
  const remainingCells = 42 - cells.length
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(year, month + 1, day)
    cells.push(createDayCell(date, day, false))
  }

  return cells
})

/**
 * Events for the selected day (mobile panel)
 */
const selectedDayEvents = computed(() => {
  return getEventsForDate(props.selectedDate)
})

/**
 * Formatted selected date for panel header
 */
const formatSelectedDate = computed(() => {
  return props.selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  })
})

// ============================================================================
// Methods
// ============================================================================

function createDayCell(date: Date, dayOfMonth: number, isCurrentMonth: boolean): DayCell {
  const today = new Date()
  const dayOfWeek = date.getDay()

  return {
    date,
    dayOfMonth,
    isToday: isSameDay(date, today),
    isCurrentMonth,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    isSelected: isSameDay(date, props.selectedDate),
    events: getEventsForDate(date)
  }
}

function getEventsForDate(date: Date): CalendarEvent[] {
  return props.events.filter((event) => {
    const eventStart = new Date(event.from)
    const eventEnd = new Date(event.to)

    return (
      isSameDay(eventStart, date) ||
      isSameDay(eventEnd, date) ||
      (eventStart < date && eventEnd > date)
    )
  }).sort((a, b) => a.from.getTime() - b.from.getTime())
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getDayCellClasses(cell: DayCell): Record<string, boolean> {
  return {
    'day-cell--today': cell.isToday,
    'day-cell--selected': cell.isSelected,
    'day-cell--other-month': !cell.isCurrentMonth,
    'day-cell--weekend': cell.isWeekend,
    'day-cell--has-events': cell.events.length > 0
  }
}

function getEventClasses(event: CalendarEvent): Record<string, boolean> {
  const colorConfig = EVENT_COLORS[event.color]
  return {
    [colorConfig.bg]: true,
    [colorConfig.text]: true,
    [colorConfig.border]: true
  }
}

function getEventDotClass(event: CalendarEvent): string {
  return EVENT_COLORS[event.color].dot
}

function formatEventTime(event: CalendarEvent): string {
  if (event.isAllDay) return ''
  return event.from.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).replace(' ', '')
}

function formatEventTimeRange(event: CalendarEvent): string {
  if (event.isAllDay) return 'All Day'

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

function getAriaLabel(cell: DayCell): string {
  const dateStr = cell.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const eventCount = cell.events.length
  const eventStr = eventCount > 0 ? `, ${eventCount} event${eventCount > 1 ? 's' : ''}` : ''

  return `${dateStr}${eventStr}`
}

function handleDayClick(cell: DayCell) {
  emit('select-day', cell.date)

  // On mobile, show the events panel
  if (window.innerWidth < 768) {
    showMobileEventsPanel.value = true
  }
}

// Close mobile panel when selected date changes externally
watch(() => props.selectedDate, () => {
  // Keep panel open but update content
})
</script>

<style scoped>
.month-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--depth-2-shadow);
  overflow: hidden;
}

/* Day Headers */
.day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 2px solid var(--color-border-primary);
}

.day-header {
  padding: var(--space-3) 0;
  text-align: center;
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
}

.day-header--weekend {
  color: var(--color-text-muted);
}

/* Calendar Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
}

.day-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: var(--space-1);
  border-bottom: 1px solid var(--color-border-primary);
  border-right: 1px solid var(--color-border-primary);
  text-align: left;
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
  min-height: 80px;
}

.day-cell:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--color-info-solid);
}

.day-cell:active {
  background: var(--color-bg-secondary);
}

.day-cell:nth-child(7n) {
  border-right: 0;
}

.day-cell--today {
  background: var(--color-warning-bg);
}

.day-cell--today .day-number {
  background: var(--color-info-solid);
  color: white;
  border-radius: var(--radius-full);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-cell--selected {
  background: var(--color-info-bg);
}

.day-cell--other-month {
  background: var(--color-bg-secondary);
}

.day-cell--other-month .day-number {
  color: var(--color-text-muted);
}

.day-cell--weekend {
  background: var(--color-bg-secondary);
  opacity: 0.5;
}

/* Day Number */
.day-number {
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

/* Events Container */
.events-container {
  flex: 1;
  overflow: hidden;
}

.desktop-events {
  display: none;
  flex-direction: column;
  gap: 2px;
}

@media (min-width: 768px) {
  .desktop-events {
    display: flex;
  }
}

.mobile-events {
  display: flex;
  gap: var(--space-1);
  margin-top: var(--space-1);
}

@media (min-width: 768px) {
  .mobile-events {
    display: none;
  }
}

/* Event Pills (Desktop) */
.event-pill {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-12);
  border-radius: var(--radius-xs);
  border: 1px solid;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.event-pill:active {
  opacity: 0.8;
}

.event-time {
  font-weight: var(--font-weight-medium);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-size: 10px;
  opacity: 0.75;
}

.event-name {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.more-events {
  font-size: var(--font-size-12);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  padding: var(--space-1) var(--space-2);
}

/* Event Dots (Mobile) */
.event-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
}

/* Mobile Events Panel */
.mobile-events-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-primary);
  border-top: 2px solid var(--color-border-primary);
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
  box-shadow: var(--depth-4-shadow);
  z-index: 30;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-primary);
}

.panel-title {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.panel-close {
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 40px;
  min-width: 40px;
}

.panel-close:active {
  background: var(--color-bg-secondary);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

.no-events {
  text-align: center;
  padding: var(--space-8) 0;
}

.no-events p {
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.event-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid;
  text-align: left;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.event-item:active {
  box-shadow: var(--depth-2-shadow);
  transform: scale(0.95);
}

.event-time-full {
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  opacity: 0.75;
}

.event-name-full {
  font-weight: var(--font-weight-medium);
}

.add-event-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-info-solid);
  color: white;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 44px;
}

.add-event-btn:active {
  background: #4f46e5;
  transform: scale(0.95);
}

.add-event-btn--inline {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  margin-top: var(--space-2);
}

.add-event-btn--inline:active {
  background: var(--color-bg-active);
}

/* Slide up transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform var(--duration-normal) var(--ease-in-out),
              opacity var(--duration-normal) var(--ease-in-out);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .day-cell {
    min-height: 60px;
    padding: var(--space-1);
  }

  .day-number {
    font-size: var(--font-size-12);
  }

  .day-cell--today .day-number {
    width: 20px;
    height: 20px;
    font-size: var(--font-size-12);
  }

  .day-header {
    padding: var(--space-2) 0;
    font-size: var(--font-size-12);
  }
}
</style>
