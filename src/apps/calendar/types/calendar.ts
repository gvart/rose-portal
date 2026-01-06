/**
 * Calendar App Type Definitions
 *
 * These types align with the backend API structure from CalendarEntrypoint.kt
 */

// ============================================================================
// API Types (match backend DTOs)
// ============================================================================

/**
 * Request payload for creating an event
 * Maps to: CreateEventRequest in CalendarEntrypoint.kt
 */
export interface CreateEventRequest {
  eventName: string
  from: string // ISO 8601 string
  to: string // ISO 8601 string
  color: string
}

/**
 * Request payload for updating an event
 * Maps to: UpdateEventRequest in CalendarEntrypoint.kt
 */
export interface UpdateEventRequest {
  eventName: string
  from: string // ISO 8601 string
  to: string // ISO 8601 string
  color: string
}

/**
 * Response from event creation/update
 * Maps to: CreateEventResponse in CalendarEntrypoint.kt
 */
export interface ApiEventResponse {
  eventId: number
  createdAt: string // ISO 8601 string
  updatedAt: string // ISO 8601 string
  createdBy: ApiUser
  eventName: string
  from: string // ISO 8601 string
  to: string // ISO 8601 string
  color: string
}

/**
 * User information from API
 * Maps to: User in CalendarEntrypoint.kt
 */
export interface ApiUser {
  id: string
  name: string
}

// ============================================================================
// Internal Application Types
// ============================================================================

/**
 * Calendar event with parsed dates (internal use)
 */
export interface CalendarEvent {
  id: number
  eventName: string
  from: Date
  to: Date
  color: EventColor
  isAllDay: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: User
}

/**
 * User information (internal use)
 */
export interface User {
  id: string
  name: string
}

/**
 * Available event colors
 */
export type EventColor =
  | 'indigo'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'

/**
 * Color configuration for events
 */
export interface EventColorConfig {
  id: EventColor
  name: string
  bg: string
  text: string
  border: string
  dot: string
}

/**
 * Event color palette
 */
export const EVENT_COLORS: Record<EventColor, EventColorConfig> = {
  indigo: {
    id: 'indigo',
    name: 'Indigo',
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-300',
    dot: 'bg-indigo-500'
  },
  red: {
    id: 'red',
    name: 'Red',
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    dot: 'bg-red-500'
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    dot: 'bg-orange-500'
  },
  yellow: {
    id: 'yellow',
    name: 'Yellow',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    dot: 'bg-yellow-500'
  },
  green: {
    id: 'green',
    name: 'Green',
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    dot: 'bg-green-500'
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    dot: 'bg-blue-500'
  },
  purple: {
    id: 'purple',
    name: 'Purple',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    dot: 'bg-purple-500'
  },
  pink: {
    id: 'pink',
    name: 'Pink',
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    border: 'border-pink-300',
    dot: 'bg-pink-500'
  }
}

// ============================================================================
// View Types
// ============================================================================

/**
 * Available calendar view modes
 */
export type CalendarView = 'month' | 'week' | 'day'

/**
 * View configuration
 */
export interface ViewConfig {
  id: CalendarView
  label: string
  shortLabel: string
}

export const VIEW_OPTIONS: ViewConfig[] = [
  { id: 'month', label: 'Month', shortLabel: 'M' },
  { id: 'week', label: 'Week', shortLabel: 'W' },
  { id: 'day', label: 'Day', shortLabel: 'D' }
]

// ============================================================================
// Calendar Grid Types
// ============================================================================

/**
 * Represents a single day cell in month view
 */
export interface DayCell {
  date: Date
  dayOfMonth: number
  isToday: boolean
  isCurrentMonth: boolean
  isWeekend: boolean
  isSelected: boolean
  events: CalendarEvent[]
}

/**
 * Represents a week row in month view
 */
export interface WeekRow {
  weekNumber: number
  days: DayCell[]
}

/**
 * Represents a time slot in week/day view
 */
export interface TimeSlot {
  hour: number
  minute: number
  label: string
  events: CalendarEvent[]
}

/**
 * Day column for week view
 */
export interface DayColumn {
  date: Date
  dayOfWeek: string
  dayOfMonth: number
  isToday: boolean
  isWeekend: boolean
  timeSlots: TimeSlot[]
  allDayEvents: CalendarEvent[]
}

// ============================================================================
// Modal/Form Types
// ============================================================================

/**
 * Modal operation mode
 */
export type ModalMode = 'create' | 'edit'

/**
 * Form data for event creation/editing
 */
export interface EventFormData {
  eventName: string
  startDate: Date
  startTime: string // HH:mm format
  endDate: Date
  endTime: string // HH:mm format
  isAllDay: boolean
  color: EventColor
}

/**
 * Default form values
 */
export const DEFAULT_EVENT_FORM: EventFormData = {
  eventName: '',
  startDate: new Date(),
  startTime: '09:00',
  endDate: new Date(),
  endTime: '10:00',
  isAllDay: false,
  color: 'indigo'
}

// ============================================================================
// Date Range Types
// ============================================================================

/**
 * Date range for API queries and caching
 */
export interface DateRange {
  from: Date
  to: Date
}

/**
 * Check if a date falls within a range
 */
export function isDateInRange(date: Date, range: DateRange): boolean {
  return date >= range.from && date <= range.to
}

/**
 * Check if two ranges overlap
 */
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.from <= b.to && a.to >= b.from
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Business hours configuration
 */
export interface BusinessHours {
  start: number // Hour (0-23)
  end: number // Hour (0-23)
}

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  start: 8,
  end: 18
}

/**
 * Calendar configuration options
 */
export interface CalendarConfig {
  firstDayOfWeek: 0 | 1 // 0 = Sunday, 1 = Monday
  businessHours: BusinessHours
  showWeekNumbers: boolean
  timeSlotDuration: 30 | 60 // minutes
}

export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  firstDayOfWeek: 0,
  businessHours: DEFAULT_BUSINESS_HOURS,
  showWeekNumbers: false,
  timeSlotDuration: 60
}

// ============================================================================
// Keyboard Navigation
// ============================================================================

/**
 * Keyboard shortcut definitions
 */
export const KEYBOARD_SHORTCUTS = {
  TODAY: 't',
  MONTH_VIEW: 'm',
  WEEK_VIEW: 'w',
  DAY_VIEW: 'd',
  CREATE_EVENT: 'c',
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown'
} as const
