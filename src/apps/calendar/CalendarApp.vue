<template>
  <AppLayout title="Calendar" theme-color="#6366F1">
    <div class="calendar-app">
      <!-- Calendar Header with Navigation -->
      <CalendarHeader
        :title="store.viewTitle"
        :current-view="store.currentView"
        :is-today="store.isToday"
        :loading="store.loading"
        :available-usernames="store.availableUsernames"
        :selected-usernames="store.selectedUsernames"
        @previous="store.navigatePrevious()"
        @next="store.navigateNext()"
        @today="store.goToToday()"
        @view-change="store.setView($event)"
        @create-event="store.openCreateModal()"
        @toggle-filter="store.toggleUsernameFilter($event)"
        @clear-filter="store.clearUsernameFilter()"
      />

      <!-- FullCalendar Component -->
      <div class="calendar-content">
        <FullCalendar
          ref="fullCalendarRef"
          :options="calendarOptions"
        />
      </div>

      <!-- Event Modal -->
      <EventModal
        v-model="store.showEventModal"
        :mode="store.modalMode"
        :form-data="store.eventFormData"
        :selected-event="store.selectedEvent"
        :loading="store.loading"
        @save="handleSaveEvent"
        @delete="handleDeleteEvent"
        @update:form-data="store.eventFormData = $event"
      />

      <!-- Error Banner -->
      <Transition name="fade">
        <div v-if="store.error" class="error-banner">
          <div class="error-content">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="error-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span class="error-text">{{ store.error }}</span>
          </div>
          <button @click="store.clearError()" class="error-close">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="close-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Transition>

      <!-- Loading Indicator -->
      <Transition name="fade">
        <div v-if="store.loading && !store.showEventModal" class="loading-indicator">
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
        </div>
      </Transition>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventClickArg, DateSelectArg, EventDropArg, EventResizeArg, EventMountArg, DatesSetArg } from '@fullcalendar/core'

import AppLayout from '@/layouts/AppLayout.vue'
import CalendarHeader from './components/CalendarHeader.vue'
import EventModal from './components/EventModal.vue'
import { useCalendarStore } from './stores/calendarStore'
import type { EventFormData } from './types/calendar'
import { KEYBOARD_SHORTCUTS } from './types/calendar'
import { transformToFullCalendarEvent, getFullCalendarView } from './utils/fullcalendarHelpers'

const store = useCalendarStore()
const route = useRoute()
const router = useRouter()

const fullCalendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)

// ============================================================================
// Viewport Detection for PWA & Pi5
// ============================================================================

const isSmallViewport = computed(() => {
  return window.innerWidth <= 1024 && window.innerHeight <= 600
})

function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

// ============================================================================
// FullCalendar Event Transformation
// ============================================================================

const fullCalendarEvents = computed(() => {
  const filteredEvents = store.currentView === 'month'
    ? store.monthEvents
    : store.currentView === 'week'
    ? store.weekEvents
    : store.dayEvents

  return filteredEvents.map(transformToFullCalendarEvent)
})

// ============================================================================
// FullCalendar Configuration
// ============================================================================

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],

  // Initial view
  initialView: getFullCalendarView(store.currentView),
  initialDate: store.selectedDate,

  // Hide default header (we use CalendarHeader component)
  headerToolbar: false,

  // Enable interactions
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,

  // Events from store (reactive)
  events: fullCalendarEvents.value,

  // Event callbacks
  eventClick: handleEventClick,
  select: handleDateSelect,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  datesSet: handleDatesSet,
  eventDidMount: handleEventDidMount,

  // Styling
  height: 'auto',
  nowIndicator: true,
  weekends: true,
  firstDay: 1, // Monday

  // Time configuration (24-hour format)
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },
  slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },
  slotMinTime: '00:00:00',
  slotMaxTime: '24:00:00',

  // Responsive configuration for small screens
  ...(isSmallViewport.value ? {
    slotDuration: '01:00:00', // Hourly slots (less dense)
    slotLabelInterval: '01:00', // Show label every hour
    dayMaxEvents: 2, // Limit events shown in day cells
    dayPopoverFormat: { month: 'short', day: 'numeric' }, // Compact format
    eventMaxStack: 2, // Max stacked events
    dayHeaderFormat: { weekday: 'short' }, // Abbreviated day names
  } : {
    slotDuration: '00:30:00', // 30-min slots for larger screens
    slotLabelInterval: '01:00',
    dayMaxEvents: true,
  }),

  // Touch optimization
  longPressDelay: 500, // Longer delay for touch devices
  eventLongPressDelay: 500,
  selectLongPressDelay: 500,

  // Larger touch targets for PWA
  eventMinHeight: isPWA() ? 44 : 28,

  // Scroll time optimization for touchscreens
  scrollTime: '08:00:00', // Start at 8 AM
  scrollTimeReset: false, // Don't reset scroll position
}))

// ============================================================================
// FullCalendar Event Handlers
// ============================================================================

// Click event to edit
function handleEventClick(clickInfo: EventClickArg) {
  const eventId = parseInt(clickInfo.event.id)
  const event = store.events.find(e => e.id === eventId)

  if (event) {
    store.openEditModal(event)
  }
}

// Click/drag empty slot to create
function handleDateSelect(selectInfo: DateSelectArg) {
  const { start, end, allDay } = selectInfo

  // Open create modal with prefilled date/time range
  if (allDay) {
    // For all-day events, use the full day range
    store.openCreateModal(start, undefined)
    // Update form data with proper end date
    store.eventFormData.endDate = new Date(end.getTime() - 1) // Subtract 1ms to get the last selected day
    store.eventFormData.isAllDay = true
  } else {
    // For timed events, use the selected time range
    store.openCreateModal(start, formatTime(start))
    store.eventFormData.startTime = formatTime(start)
    store.eventFormData.endDate = end
    store.eventFormData.endTime = formatTime(end)
    store.eventFormData.isAllDay = false
  }

  // Clear selection
  if (fullCalendarRef.value) {
    fullCalendarRef.value.getApi().unselect()
  }
}

// Drag event to reschedule
async function handleEventDrop(info: EventDropArg) {
  const event = info.event
  const calendarEvent = store.events.find(e => e.id === parseInt(event.id))

  if (!calendarEvent) return

  // Build form data with new dates
  const formData: EventFormData = {
    eventName: calendarEvent.eventName,
    startDate: event.start!,
    startTime: event.allDay ? '' : formatTime(event.start!),
    endDate: event.end || event.start!,
    endTime: event.allDay ? '' : formatTime(event.end || event.start!),
    isAllDay: event.allDay,
    color: calendarEvent.color,
    reminderTime: calendarEvent.reminderTime
  }

  // Update via API
  const success = await store.updateEvent(calendarEvent.id, formData)

  // Revert if failed
  if (!success) {
    info.revert()
  }
}

// Resize event to change duration
async function handleEventResize(info: EventResizeArg) {
  const event = info.event
  const calendarEvent = store.events.find(e => e.id === parseInt(event.id))

  if (!calendarEvent) return

  const formData: EventFormData = {
    eventName: calendarEvent.eventName,
    startDate: event.start!,
    startTime: event.allDay ? '' : formatTime(event.start!),
    endDate: event.end!,
    endTime: event.allDay ? '' : formatTime(event.end!),
    isAllDay: event.allDay,
    color: calendarEvent.color,
    reminderTime: calendarEvent.reminderTime
  }

  const success = await store.updateEvent(calendarEvent.id, formData)

  if (!success) {
    info.revert()
  }
}

// Handle date range changes for fetching events
function handleDatesSet(dateInfo: DatesSetArg) {
  const { start, end } = dateInfo
  // Trigger event fetch if needed (store handles caching)
  store.fetchEventsForRange(start, end)
}

// Add custom styling and creator badge
function handleEventDidMount(info: EventMountArg) {
  // Add haptic feedback on touch
  info.el.addEventListener('touchstart', () => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(10)
    }
  })

  // Add creator badge if available
  if (info.event.extendedProps.createdBy?.name) {
    const titleEl = info.el.querySelector('.fc-event-title')
    if (titleEl) {
      titleEl.setAttribute('data-creator', ` by ${info.event.extendedProps.createdBy.name}`)
    }
  }
}

// Helper to format time
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// ============================================================================
// Event Modal Handlers
// ============================================================================

async function handleSaveEvent(formData: EventFormData) {
  let success = false

  if (store.modalMode === 'create') {
    const event = await store.createEvent(formData)
    success = event !== null
  } else if (store.selectedEvent) {
    const event = await store.updateEvent(store.selectedEvent.id, formData)
    success = event !== null
  }

  if (success) {
    store.closeModal()
  }
}

async function handleDeleteEvent() {
  if (store.selectedEvent) {
    const success = await store.deleteEvent(store.selectedEvent.id)
    if (success) {
      store.closeModal()
    }
  }
}

// ============================================================================
// Deep Link Handling
// ============================================================================

// Watch for eventId in URL query params (from notifications)
watch(
  () => route.query.eventId,
  async (eventId) => {
    if (eventId) {
      const eventIdNum = parseInt(eventId as string, 10)
      if (!isNaN(eventIdNum)) {
        console.log('[Calendar] Deep link to event:', eventIdNum)

        // Load events if not already loaded
        if (store.events.length === 0) {
          await store.fetchEventsForCurrentView()
        }

        // Find and open the event
        const event = store.events.find(e => e.id === eventIdNum)
        if (event) {
          // Switch to the requested view if specified
          const view = route.query.view as string
          if (view && (view === 'day' || view === 'week' || view === 'month')) {
            store.setView(view)
          }

          // Navigate to event date
          if (fullCalendarRef.value) {
            fullCalendarRef.value.getApi().gotoDate(event.from)
          }

          // Open the event modal
          store.openEditModal(event)

          // Clear the query param after handling
          router.replace({ query: {} })
        } else {
          console.warn('[Calendar] Event not found:', eventIdNum)
        }
      }
    }
  },
  { immediate: true }
)

// ============================================================================
// Keyboard Navigation
// ============================================================================

function handleKeydown(event: KeyboardEvent) {
  // Don't handle if modal is open or user is typing in an input
  if (store.showEventModal) return
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return

  switch (event.key.toLowerCase()) {
    case KEYBOARD_SHORTCUTS.TODAY:
      event.preventDefault()
      store.goToToday()
      break

    case KEYBOARD_SHORTCUTS.MONTH_VIEW:
      event.preventDefault()
      store.setView('month')
      break

    case KEYBOARD_SHORTCUTS.WEEK_VIEW:
      event.preventDefault()
      store.setView('week')
      break

    case KEYBOARD_SHORTCUTS.DAY_VIEW:
      event.preventDefault()
      store.setView('day')
      break

    case KEYBOARD_SHORTCUTS.CREATE_EVENT:
      event.preventDefault()
      store.openCreateModal()
      break

    case KEYBOARD_SHORTCUTS.ARROW_LEFT:
      event.preventDefault()
      store.navigatePrevious()
      break

    case KEYBOARD_SHORTCUTS.ARROW_RIGHT:
      event.preventDefault()
      store.navigateNext()
      break
  }
}

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(async () => {
  // Initialize FullCalendar API
  if (fullCalendarRef.value) {
    const calendarApi = fullCalendarRef.value.getApi()
    store.setFullCalendarApi(calendarApi)
  }

  // Initial data fetch
  await store.fetchEventsForCurrentView()

  // Add keyboard listener
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Auto-suggest day view on very small screens
watch([isSmallViewport, () => store.currentView], ([small, view]) => {
  if (small && view === 'week') {
    console.log('[Calendar] Consider switching to day view for better visibility on small screen')
  }
})
</script>

<style scoped>
.calendar-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--space-4);
}

.calendar-content {
  flex: 1;
  overflow: auto;
}

/* FullCalendar Customization */
:deep(.fc) {
  font-family: var(--font-family);
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--depth-2-shadow);
}

:deep(.fc-event) {
  border-radius: var(--radius-xs);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-12);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

:deep(.fc-event:active) {
  opacity: 0.8;
  transform: scale(0.98);
}

/* Creator badge */
:deep(.fc-event-title::after) {
  content: attr(data-creator);
  font-size: var(--font-size-11);
  opacity: 0.65;
  margin-left: var(--space-1);
}

/* Theme color for today */
:deep(.fc-day-today) {
  background-color: var(--color-warning-bg) !important;
}

/* Now indicator */
:deep(.fc-timegrid-now-indicator-line) {
  border-color: var(--color-info-solid);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  :deep(.fc-timegrid-slot) {
    height: 3em;
  }

  :deep(.fc-event) {
    font-size: var(--font-size-11);
    padding: var(--space-1);
  }

  :deep(.fc-col-header-cell-cushion) {
    font-size: var(--font-size-12);
  }
}

/* Raspberry Pi 5 7-inch screen optimizations (800x480 or 1024x600) */
@media (max-width: 1024px) and (max-height: 600px) {
  .calendar-app {
    gap: var(--space-2);
  }

  :deep(.fc) {
    font-size: 11px;
  }

  :deep(.fc-timegrid-slot) {
    height: 2.5em;
    font-size: 10px;
  }

  :deep(.fc-col-header-cell-cushion) {
    font-size: 11px;
    padding: var(--space-1);
  }

  :deep(.fc-event) {
    font-size: 10px;
    padding: 2px 4px;
    min-height: 20px;
  }

  :deep(.fc-daygrid-day-number) {
    font-size: 11px;
    padding: var(--space-1);
  }

  /* Larger touch targets for Pi touchscreen */
  :deep(.fc-event),
  :deep(.fc-daygrid-day),
  :deep(.fc-timegrid-slot) {
    cursor: pointer;
  }

  /* Simplify week view for small screens */
  :deep(.fc-timegrid-axis) {
    width: 35px;
  }
}

/* PWA-specific optimizations */
@media (display-mode: standalone) {
  .calendar-app {
    /* Account for PWA safe areas */
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }

  :deep(.fc-event) {
    /* Larger touch targets for PWA */
    min-height: 44px; /* Apple Human Interface Guidelines */
    min-width: 44px;
  }

  :deep(.fc-timegrid-slot) {
    /* Easier to tap on PWA */
    min-height: 44px;
  }
}

/* Error Banner */
.error-banner {
  position: fixed;
  top: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-error-bg);
  border: var(--depth-1-border);
  border-color: var(--color-error-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  box-shadow: var(--depth-3-shadow);
  z-index: 1000;
  max-width: 90%;
}

.error-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.error-icon {
  width: 20px;
  height: 20px;
  color: var(--color-error-solid);
  flex-shrink: 0;
}

.error-text {
  color: var(--color-text-primary);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-medium);
}

.error-close {
  background: transparent;
  border: none;
  padding: var(--space-1);
  cursor: pointer;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.error-close:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.close-icon {
  width: 16px;
  height: 16px;
}

/* Loading Indicator */
.loading-indicator {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  z-index: 999;
}

.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-info-solid);
  animation: loading-bounce 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading-bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal) var(--ease-in-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
