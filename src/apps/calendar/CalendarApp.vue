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

      <!-- Calendar Views -->
      <div class="calendar-content">
        <Transition name="view-fade" mode="out-in">
          <!-- Month View -->
          <MonthView
            v-if="store.currentView === 'month'"
            key="month"
            :selected-date="store.selectedDate"
            :events="store.monthEvents"
            @select-day="handleSelectDay"
            @select-event="store.openEditModal($event)"
            @create-event="handleQuickCreate"
          />

          <!-- Week View -->
          <WeekView
            v-else-if="store.currentView === 'week'"
            key="week"
            :selected-date="store.selectedDate"
            :events="store.weekEvents"
            @select-day="handleSelectDay"
            @select-event="store.openEditModal($event)"
            @create-event="handleQuickCreate"
          />

          <!-- Day View -->
          <DayView
            v-else-if="store.currentView === 'day'"
            key="day"
            :selected-date="store.selectedDate"
            :events="store.dayEvents"
            @select-event="store.openEditModal($event)"
            @create-event="handleQuickCreate"
          />
        </Transition>
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
          <button v-haptic:light @click="store.clearError()" class="error-close">
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
import { onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import CalendarHeader from './components/CalendarHeader.vue'
import MonthView from './components/MonthView.vue'
import WeekView from './components/WeekView.vue'
import DayView from './components/DayView.vue'
import EventModal from './components/EventModal.vue'
import { useCalendarStore } from './stores/calendarStore'
import type { CalendarEvent, EventFormData } from './types/calendar'
import { KEYBOARD_SHORTCUTS } from './types/calendar'

const store = useCalendarStore()
const route = useRoute()
const router = useRouter()

// ============================================================================
// Event Handlers
// ============================================================================

function handleSelectDay(date: Date) {
  store.selectDay(date)
}

function handleQuickCreate(date: Date, time?: string) {
  store.openCreateModal(date, time)
}

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
  // Initial data fetch
  await store.fetchEventsForCurrentView()

  // Handle deep link from notification
  const eventId = route.query.eventId as string | undefined
  const viewParam = route.query.view as string | undefined

  if (eventId) {
    const numericId = parseInt(eventId, 10)

    if (!isNaN(numericId)) {
      console.log('[Calendar] Deep link detected - eventId:', numericId)

      // Find the event in the store
      let event = store.events.find(e => e.id === numericId)

      if (event) {
        // Event found in cache
        console.log('[Calendar] Event found in cache:', event)

        // Navigate to event date if specified view
        if (viewParam === 'day' || viewParam === 'week') {
          store.setView(viewParam)
        }
        store.navigateToDate(event.from)

        // Open event modal
        store.openEditModal(event)
      } else {
        // Event not in cache - it should be fetched by now, but double check
        console.warn('[Calendar] Event not found in cache, checking again')

        // Wait a bit for events to load
        await new Promise(resolve => setTimeout(resolve, 500))

        event = store.events.find(e => e.id === numericId)

        if (event) {
          console.log('[Calendar] Event found after delay:', event)

          if (viewParam === 'day' || viewParam === 'week') {
            store.setView(viewParam)
          }
          store.navigateToDate(event.from)
          store.openEditModal(event)
        } else {
          console.error('[Calendar] Event not found:', numericId)
          // Show error message
          store.error = 'Event not found'
        }
      }

      // Clean up query parameters
      router.replace({ query: {} })
    }
  }

  // Register keyboard listeners
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.calendar-app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.calendar-content {
  flex: 1;
  overflow: hidden;
}

/* View transition */
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.view-fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.view-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* Error Banner */
.error-banner {
  position: fixed;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-error-bg);
  border: 2px solid var(--color-error-solid);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  box-shadow: var(--depth-4-shadow);
  max-width: 48rem;
  z-index: 40;
}

.error-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.error-icon {
  width: 24px;
  height: 24px;
  color: var(--color-error-solid);
  flex-shrink: 0;
}

.error-text {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-medium);
  color: var(--color-error-text);
}

.error-close {
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 40px;
  min-width: 40px;
}

.error-close:active {
  background: var(--color-error-border);
}

.close-icon {
  width: 20px;
  height: 20px;
  color: var(--color-error-solid);
}

/* Loading Indicator */
.loading-indicator {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  display: flex;
  gap: var(--space-1);
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: var(--color-info-solid);
  border-radius: var(--radius-full);
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
  }
  40% {
    transform: scale(1);
  }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
