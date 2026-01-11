/**
 * Calendar Pinia Store
 *
 * Manages calendar state including events, navigation, and UI state.
 * Follows patterns from existing stores (plantStore, mealPrepStore).
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as calendarApi from '../services/calendarApi'
import type {
  CalendarEvent,
  CalendarView,
  DateRange,
  EventColor,
  ModalMode,
  EventFormData,
  DEFAULT_EVENT_FORM
} from '../types/calendar'

export const useCalendarStore = defineStore('calendar', () => {
  // ============================================================================
  // State
  // ============================================================================

  // View state
  const currentView = ref<CalendarView>('month')
  const selectedDate = ref<Date>(new Date())
  const focusedDate = ref<Date>(new Date())

  // Events
  const events = ref<CalendarEvent[]>([])
  const selectedEvent = ref<CalendarEvent | null>(null)

  // UI state
  const loading = ref(false)
  const error = ref<string | null>(null)
  const showEventModal = ref(false)
  const modalMode = ref<ModalMode>('create')

  // Form state for modal
  const eventFormData = ref<EventFormData>({
    eventName: '',
    startDate: new Date(),
    startTime: '09:00',
    endDate: new Date(),
    endTime: '10:00',
    isAllDay: false,
    color: 'indigo'
  })

  // Filter state
  const selectedUsernames = ref<string[]>([])

  // Cache tracking - avoid duplicate API calls
  const fetchedRanges = ref<DateRange[]>([])

  // ============================================================================
  // Computed
  // ============================================================================

  /**
   * Get unique usernames from all events
   */
  const availableUsernames = computed(() => {
    const usernames = new Set<string>()
    events.value.forEach(event => {
      if (event.createdBy?.name) {
        usernames.add(event.createdBy.name)
      }
    })
    return Array.from(usernames).sort()
  })

  /**
   * Helper to apply username filter
   */
  function applyUsernameFilter(eventsList: CalendarEvent[]): CalendarEvent[] {
    if (selectedUsernames.value.length === 0) {
      return eventsList
    }
    return eventsList.filter(event => {
      return selectedUsernames.value.includes(event.createdBy?.name || '')
    })
  }

  /**
   * Get events for the currently selected month
   */
  const monthEvents = computed(() => {
    const start = startOfMonth(selectedDate.value)
    const end = endOfMonth(selectedDate.value)

    const filtered = events.value.filter((event) => {
      return eventInRange(event, start, end)
    })

    return applyUsernameFilter(filtered)
  })

  /**
   * Get events for the currently selected week
   */
  const weekEvents = computed(() => {
    const start = startOfWeek(selectedDate.value)
    const end = endOfWeek(selectedDate.value)

    const filtered = events.value.filter((event) => {
      return eventInRange(event, start, end)
    })

    return applyUsernameFilter(filtered)
  })

  /**
   * Get events for the currently selected day
   */
  const dayEvents = computed(() => {
    const filtered = events.value.filter((event) => {
      return isSameDay(event.from, selectedDate.value) ||
             isSameDay(event.to, selectedDate.value) ||
             (event.from < selectedDate.value && event.to > selectedDate.value)
    })

    return applyUsernameFilter(filtered)
  })

  /**
   * Get events for a specific date
   */
  function getEventsForDate(date: Date): CalendarEvent[] {
    const filtered = events.value.filter((event) => {
      return isSameDay(event.from, date) ||
             isSameDay(event.to, date) ||
             (event.from < date && event.to > date)
    })
    return applyUsernameFilter(filtered)
  }

  /**
   * Check if a date has events
   */
  function dateHasEvents(date: Date): boolean {
    return getEventsForDate(date).length > 0
  }

  /**
   * Current view title (e.g., "January 2026")
   */
  const viewTitle = computed(() => {
    const date = selectedDate.value

    switch (currentView.value) {
      case 'month':
        return formatMonthYear(date)

      case 'week': {
        const weekStart = startOfWeek(date)
        const weekEnd = endOfWeek(date)

        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${formatMonthDay(weekStart)} - ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
        } else {
          return `${formatMonthDay(weekStart)} - ${formatMonthDay(weekEnd)}, ${weekEnd.getFullYear()}`
        }
      }

      case 'day':
        return formatFullDate(date)

      default:
        return ''
    }
  })

  /**
   * Check if selected date is today
   */
  const isToday = computed(() => {
    return isSameDay(selectedDate.value, new Date())
  })

  // ============================================================================
  // Actions - Navigation
  // ============================================================================

  /**
   * Set the current view mode
   */
  function setView(view: CalendarView) {
    currentView.value = view
    fetchEventsForCurrentView()
  }

  /**
   * Navigate to a specific date
   */
  function navigateToDate(date: Date) {
    selectedDate.value = new Date(date)
    focusedDate.value = new Date(date)
    fetchEventsForCurrentView()
  }

  /**
   * Navigate to today
   */
  function goToToday() {
    navigateToDate(new Date())
  }

  /**
   * Navigate to previous period (month/week/day)
   */
  function navigatePrevious() {
    const date = selectedDate.value

    switch (currentView.value) {
      case 'month':
        navigateToDate(addMonths(date, -1))
        break
      case 'week':
        navigateToDate(addDays(date, -7))
        break
      case 'day':
        navigateToDate(addDays(date, -1))
        break
    }
  }

  /**
   * Navigate to next period (month/week/day)
   */
  function navigateNext() {
    const date = selectedDate.value

    switch (currentView.value) {
      case 'month':
        navigateToDate(addMonths(date, 1))
        break
      case 'week':
        navigateToDate(addDays(date, 7))
        break
      case 'day':
        navigateToDate(addDays(date, 1))
        break
    }
  }

  /**
   * Select a specific day (from month view click)
   */
  function selectDay(date: Date) {
    selectedDate.value = new Date(date)
    focusedDate.value = new Date(date)
  }

  // ============================================================================
  // Actions - Events CRUD
  // ============================================================================

  /**
   * Fetch events for the current view's date range
   */
  async function fetchEventsForCurrentView() {
    let from: Date
    let to: Date

    switch (currentView.value) {
      case 'month':
        // Fetch entire month plus overflow days
        from = startOfWeek(startOfMonth(selectedDate.value))
        to = endOfWeek(endOfMonth(selectedDate.value))
        break
      case 'week':
        from = startOfWeek(selectedDate.value)
        to = endOfWeek(selectedDate.value)
        break
      case 'day':
        from = startOfDay(selectedDate.value)
        to = endOfDay(selectedDate.value)
        break
    }

    await fetchEventsForRange(from, to)
  }

  /**
   * Fetch events for a specific date range
   * Implements caching to avoid duplicate API calls
   */
  async function fetchEventsForRange(from: Date, to: Date) {
    // Check if range is already cached
    if (isRangeCached(from, to)) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const newEvents = await calendarApi.getEvents(from, to)

      // Merge with existing events, avoiding duplicates
      mergeEvents(newEvents)

      // Track that we've fetched this range
      addFetchedRange(from, to)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load events'
      console.error('Failed to fetch events:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new event
   */
  async function createEvent(formData: EventFormData): Promise<CalendarEvent | null> {
    loading.value = true
    error.value = null

    try {
      const { from, to } = formDataToDateRange(formData)

      const newEvent = await calendarApi.createEvent(
        formData.eventName,
        from,
        to,
        formData.color,
        formData.isAllDay
      )

      // Add to local state
      events.value.push(newEvent)

      return newEvent
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create event'
      console.error('Failed to create event:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing event
   */
  async function updateEvent(id: number, formData: EventFormData): Promise<CalendarEvent | null> {
    loading.value = true
    error.value = null

    try {
      const { from, to } = formDataToDateRange(formData)

      const updatedEvent = await calendarApi.updateEvent(
        id,
        formData.eventName,
        from,
        to,
        formData.color,
        formData.isAllDay
      )

      // Update in local state
      const index = events.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        events.value[index] = updatedEvent
      }

      return updatedEvent
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update event'
      console.error('Failed to update event:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete an event
   */
  async function deleteEvent(id: number): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await calendarApi.deleteEvent(id)

      // Remove from local state
      events.value = events.value.filter((e) => e.id !== id)

      // Clear selection if this was the selected event
      if (selectedEvent.value?.id === id) {
        selectedEvent.value = null
      }

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete event'
      console.error('Failed to delete event:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  // ============================================================================
  // Actions - Modal Management
  // ============================================================================

  /**
   * Open modal to create a new event
   */
  function openCreateModal(prefilledDate?: Date, prefilledTime?: string) {
    const date = prefilledDate || selectedDate.value

    eventFormData.value = {
      eventName: '',
      startDate: new Date(date),
      startTime: prefilledTime || '09:00',
      endDate: new Date(date),
      endTime: prefilledTime ? addTimeHours(prefilledTime, 1) : '10:00',
      isAllDay: false,
      color: 'indigo'
    }

    selectedEvent.value = null
    modalMode.value = 'create'
    showEventModal.value = true
  }

  /**
   * Open modal to edit an existing event
   */
  function openEditModal(event: CalendarEvent) {
    selectedEvent.value = event

    eventFormData.value = {
      eventName: event.eventName,
      startDate: new Date(event.from),
      startTime: formatTime(event.from),
      endDate: new Date(event.to),
      endTime: formatTime(event.to),
      isAllDay: event.isAllDay,
      color: event.color
    }

    modalMode.value = 'edit'
    showEventModal.value = true
  }

  /**
   * Close the event modal
   */
  function closeModal() {
    showEventModal.value = false
    selectedEvent.value = null
  }

  /**
   * Clear any displayed error
   */
  function clearError() {
    error.value = null
  }

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Check if a range is already cached
   */
  function isRangeCached(from: Date, to: Date): boolean {
    return fetchedRanges.value.some(
      (range) => range.from <= from && range.to >= to
    )
  }

  /**
   * Add a range to the cache tracking
   */
  function addFetchedRange(from: Date, to: Date) {
    // Simple implementation - could be optimized to merge overlapping ranges
    fetchedRanges.value.push({ from, to })
  }

  /**
   * Merge new events with existing, avoiding duplicates
   */
  function mergeEvents(newEvents: CalendarEvent[]) {
    const existingIds = new Set(events.value.map((e) => e.id))

    for (const event of newEvents) {
      if (!existingIds.has(event.id)) {
        events.value.push(event)
      }
    }
  }

  /**
   * Check if an event falls within a date range
   */
  function eventInRange(event: CalendarEvent, start: Date, end: Date): boolean {
    return (
      (event.from >= start && event.from <= end) ||
      (event.to >= start && event.to <= end) ||
      (event.from < start && event.to > end)
    )
  }

  /**
   * Convert form data to start/end dates
   */
  function formDataToDateRange(formData: EventFormData): { from: Date; to: Date } {
    let from: Date
    let to: Date

    if (formData.isAllDay) {
      from = startOfDay(formData.startDate)
      to = endOfDay(formData.endDate)
    } else {
      from = combineDateAndTime(formData.startDate, formData.startTime)
      to = combineDateAndTime(formData.endDate, formData.endTime)
    }

    return { from, to }
  }

  // ============================================================================
  // Date Utility Functions
  // ============================================================================

  function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  function endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  }

  function startOfWeek(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
    return d
  }

  function endOfWeek(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    d.setDate(d.getDate() + (6 - day))
    d.setHours(23, 59, 59, 999)
    return d
  }

  function startOfDay(date: Date): Date {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }

  function endOfDay(date: Date): Date {
    const d = new Date(date)
    d.setHours(23, 59, 59, 999)
    return d
  }

  function addMonths(date: Date, months: number): Date {
    const d = new Date(date)
    d.setMonth(d.getMonth() + months)
    return d
  }

  function addDays(date: Date, days: number): Date {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
  }

  function isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    )
  }

  function formatMonthYear(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  function formatMonthDay(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function formatFullDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  function combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number)
    const result = new Date(date)
    result.setHours(hours, minutes, 0, 0)
    return result
  }

  function addTimeHours(time: string, hours: number): string {
    const [h, m] = time.split(':').map(Number)
    const newHour = Math.min(23, h + hours)
    return `${newHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  // ============================================================================
  // Actions - Username Filter
  // ============================================================================

  /**
   * Toggle a username in the filter
   */
  function toggleUsernameFilter(username: string) {
    const index = selectedUsernames.value.indexOf(username)
    if (index === -1) {
      selectedUsernames.value.push(username)
    } else {
      selectedUsernames.value.splice(index, 1)
    }
  }

  /**
   * Clear all username filters
   */
  function clearUsernameFilter() {
    selectedUsernames.value = []
  }

  /**
   * Set username filter to specific list
   */
  function setUsernameFilter(usernames: string[]) {
    selectedUsernames.value = [...usernames]
  }

  // ============================================================================
  // Return Public API
  // ============================================================================

  return {
    // State
    currentView,
    selectedDate,
    focusedDate,
    events,
    selectedEvent,
    loading,
    error,
    showEventModal,
    modalMode,
    eventFormData,
    selectedUsernames,

    // Computed
    monthEvents,
    weekEvents,
    dayEvents,
    viewTitle,
    isToday,
    availableUsernames,

    // Functions
    getEventsForDate,
    dateHasEvents,

    // Navigation
    setView,
    navigateToDate,
    goToToday,
    navigatePrevious,
    navigateNext,
    selectDay,

    // Events CRUD
    fetchEventsForCurrentView,
    fetchEventsForRange,
    createEvent,
    updateEvent,
    deleteEvent,

    // Modal
    openCreateModal,
    openEditModal,
    closeModal,
    clearError,

    // Filters
    toggleUsernameFilter,
    clearUsernameFilter,
    setUsernameFilter
  }
})
