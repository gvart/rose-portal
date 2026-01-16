import type { CalendarEvent, EventColor } from '../types/calendar'
import type { EventInput } from '@fullcalendar/core'

// Color mapping from Tailwind classes to hex
const COLOR_MAP: Record<EventColor, { bg: string; border: string; text: string }> = {
  indigo: { bg: '#e0e7ff', border: '#a5b4fc', text: '#3730a3' },
  red: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
  orange: { bg: '#ffedd5', border: '#fdba74', text: '#9a3412' },
  yellow: { bg: '#fef3c7', border: '#fcd34d', text: '#854d0e' },
  green: { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46' },
  blue: { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
  purple: { bg: '#f3e8ff', border: '#d8b4fe', text: '#6b21a8' },
  pink: { bg: '#fce7f3', border: '#f9a8d4', text: '#9f1239' }
}

export function transformToFullCalendarEvent(event: CalendarEvent): EventInput {
  const colorConfig = COLOR_MAP[event.color]

  return {
    id: event.id.toString(),
    title: event.eventName,
    start: event.from,
    end: event.to,
    allDay: event.isAllDay,
    backgroundColor: colorConfig.bg,
    borderColor: colorConfig.border,
    textColor: colorConfig.text,
    extendedProps: {
      reminderTime: event.reminderTime,
      createdBy: event.createdBy,
      originalColor: event.color
    }
  }
}

export function getFullCalendarView(view: 'month' | 'week' | 'day'): string {
  return {
    month: 'dayGridMonth',
    week: 'timeGridWeek',
    day: 'timeGridDay'
  }[view]
}
