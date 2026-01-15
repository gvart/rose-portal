/**
 * Calendar API Service
 *
 * Handles all HTTP communication with the backend calendar endpoints.
 * Maps to CalendarEntrypoint.kt on the backend.
 */

import axios from 'axios'
import { apiClients } from '@/services/apiClient'
import type {
  CalendarEvent,
  ApiEventResponse,
  CreateEventRequest,
  UpdateEventRequest,
  EventColor,
  ReminderTime
} from '../types/calendar'

// Use shared calendar API client
const api = apiClients.calendar

/**
 * Fetch events within a date range
 *
 * @param from - Start of date range (inclusive)
 * @param to - End of date range (inclusive)
 * @returns Array of calendar events
 */
export async function getEvents(from: Date, to: Date): Promise<CalendarEvent[]> {
  const response = await api.get<ApiEventResponse[]>('/events', {
    params: {
      from: from.toISOString(),
      to: to.toISOString()
    }
  })

  return response.data.map(transformApiEventToInternal)
}

/**
 * Create a new calendar event
 *
 * @param eventName - Name/title of the event
 * @param from - Event start time
 * @param to - Event end time
 * @param color - Optional event color (stored client-side for now)
 * @param isAllDay - Whether this is an all-day event
 * @param reminderTime - When to send reminder notification
 * @returns The created event
 */
export async function createEvent(
  eventName: string,
  from: Date,
  to: Date,
  color: EventColor = 'indigo',
  isAllDay: boolean = false,
  reminderTime: ReminderTime = 'NONE'
): Promise<CalendarEvent> {
  const request: CreateEventRequest = {
    eventName,
    from: from.toISOString(),
    to: to.toISOString(),
    color,
    reminderTime
  }

  const response = await api.post<ApiEventResponse>('/events', request)

  // Transform and add client-side properties
  const event = transformApiEventToInternal(response.data)
  event.isAllDay = isAllDay

  return event
}

/**
 * Update an existing calendar event
 *
 * @param id - Event ID to update
 * @param eventName - Updated event name
 * @param from - Updated start time
 * @param to - Updated end time
 * @param color - Optional updated color
 * @param isAllDay - Whether this is an all-day event
 * @param reminderTime - When to send reminder notification
 * @returns The updated event
 */
export async function updateEvent(
  id: number,
  eventName: string,
  from: Date,
  to: Date,
  color: EventColor = 'indigo',
  isAllDay: boolean = false,
  reminderTime: ReminderTime = 'NONE'
): Promise<CalendarEvent> {
  const request: UpdateEventRequest = {
    eventName,
    from: from.toISOString(),
    to: to.toISOString(),
    color,
    reminderTime
  }

  const response = await api.put<ApiEventResponse>(`/events/${id}`, request)

  // Transform and add client-side properties
  const event = transformApiEventToInternal(response.data)
  event.isAllDay = isAllDay

  return event
}

/**
 * Delete a calendar event
 *
 * @param id - Event ID to delete
 */
export async function deleteEvent(id: number): Promise<void> {
  await api.delete(`/events/${id}`)
}

// ============================================================================
// Transformation Helpers
// ============================================================================

/**
 * Transform API response to internal CalendarEvent format
 * Converts ISO date strings to Date objects
 */
function transformApiEventToInternal(apiEvent: ApiEventResponse): CalendarEvent {
  return {
    id: apiEvent.eventId,
    eventName: apiEvent.eventName,
    from: new Date(apiEvent.from),
    to: new Date(apiEvent.to),
    color: (apiEvent.color as EventColor) || 'indigo',
    isAllDay: isAllDayEvent(new Date(apiEvent.from), new Date(apiEvent.to)),
    reminderTime: apiEvent.reminderTime || 'NONE',
    createdAt: new Date(apiEvent.createdAt),
    updatedAt: new Date(apiEvent.updatedAt),
    createdBy: {
      id: apiEvent.username, // Use username as ID
      name: apiEvent.username
    }
  }
}

/**
 * Detect if an event spans exactly midnight to midnight (all-day)
 */
function isAllDayEvent(from: Date, to: Date): boolean {
  const fromMidnight =
    from.getHours() === 0 && from.getMinutes() === 0 && from.getSeconds() === 0

  const toMidnight =
    to.getHours() === 0 && to.getMinutes() === 0 && to.getSeconds() === 0

  // Check if it's exactly a full day or multiple full days
  if (fromMidnight && toMidnight) {
    const dayDiff = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
    return dayDiff >= 1
  }

  return false
}

// ============================================================================
// API Error Handling
// ============================================================================

/**
 * Custom error class for calendar API errors
 * @deprecated Use ApiError from @/services/apiClient instead
 */
export class CalendarApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'CalendarApiError'
  }
}

// Error handling is now done by the shared API client
