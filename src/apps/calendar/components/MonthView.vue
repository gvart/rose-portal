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
  @apply h-full flex flex-col bg-white rounded-xl shadow-md overflow-hidden;
}

/* Day Headers */
.day-headers {
  @apply grid grid-cols-7 border-b-2 border-gray-200;
}

.day-header {
  @apply py-3 text-center text-sm font-semibold text-gray-600 bg-gray-50;
}

.day-header--weekend {
  @apply text-gray-400;
}

/* Calendar Grid */
.calendar-grid {
  @apply grid grid-cols-7 flex-1;
}

.day-cell {
  @apply relative flex flex-col p-1 border-b border-r border-gray-100
         text-left transition-colors duration-150 cursor-pointer
         hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500;
  min-height: 80px;
}

.day-cell:nth-child(7n) {
  @apply border-r-0;
}

.day-cell--today {
  @apply bg-amber-50;
}

.day-cell--today .day-number {
  @apply bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center;
}

.day-cell--selected {
  @apply bg-indigo-50;
}

.day-cell--other-month {
  @apply bg-gray-50;
}

.day-cell--other-month .day-number {
  @apply text-gray-400;
}

.day-cell--weekend {
  @apply bg-gray-50/50;
}

/* Day Number */
.day-number {
  @apply text-sm font-semibold text-gray-800 mb-1;
}

/* Events Container */
.events-container {
  @apply flex-1 overflow-hidden;
}

.desktop-events {
  @apply hidden md:flex flex-col gap-0.5;
}

.mobile-events {
  @apply flex md:hidden gap-1 mt-1;
}

/* Event Pills (Desktop) */
.event-pill {
  @apply flex items-center gap-1 px-1.5 py-0.5 text-xs rounded
         border truncate cursor-pointer hover:opacity-80 transition-opacity;
}

.event-time {
  @apply font-medium text-[10px] opacity-75;
}

.event-name {
  @apply truncate;
}

.more-events {
  @apply text-xs text-gray-500 font-medium px-1.5 py-0.5;
}

/* Event Dots (Mobile) */
.event-dot {
  @apply w-1.5 h-1.5 rounded-full;
}

/* Mobile Events Panel */
.mobile-events-panel {
  @apply fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl
         border-t-2 border-gray-200 z-30 max-h-[60vh] flex flex-col;
}

.panel-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.panel-title {
  @apply text-lg font-bold text-gray-800;
}

.panel-close {
  @apply p-2 hover:bg-gray-100 rounded-lg transition-colors;
  min-height: 40px;
  min-width: 40px;
}

.panel-content {
  @apply flex-1 overflow-y-auto p-4;
}

.no-events {
  @apply text-center py-8;
}

.no-events p {
  @apply text-gray-500 mb-4;
}

.events-list {
  @apply flex flex-col gap-2;
}

.event-item {
  @apply flex flex-col gap-1 p-3 rounded-lg border text-left
         transition-all duration-150 hover:shadow-md active:scale-95;
}

.event-time-full {
  @apply text-xs font-semibold opacity-75;
}

.event-name-full {
  @apply font-medium;
}

.add-event-btn {
  @apply flex items-center justify-center gap-2 px-4 py-3
         bg-indigo-600 text-white font-semibold rounded-lg
         hover:bg-indigo-700 transition-all duration-150 active:scale-95;
  min-height: 44px;
}

.add-event-btn--inline {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200 mt-2;
}

/* Slide up transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
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
    @apply p-0.5;
  }

  .day-number {
    @apply text-xs;
  }

  .day-cell--today .day-number {
    @apply w-5 h-5 text-xs;
  }

  .day-header {
    @apply py-2 text-xs;
  }
}
</style>
