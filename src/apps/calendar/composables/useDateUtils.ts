/**
 * Date Utility Composable
 *
 * Provides common date manipulation and formatting functions
 * for use throughout the calendar app.
 */

// ============================================================================
// Date Manipulation
// ============================================================================

/**
 * Get the start of a month (first day, 00:00:00)
 */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

/**
 * Get the end of a month (last day, 23:59:59)
 */
export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

/**
 * Get the start of a week (Sunday, 00:00:00)
 * @param date - Reference date
 * @param weekStartsOn - 0 = Sunday, 1 = Monday (default: 0)
 */
export function startOfWeek(date: Date, weekStartsOn: 0 | 1 = 0): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get the end of a week (Saturday, 23:59:59)
 * @param date - Reference date
 * @param weekStartsOn - 0 = Sunday, 1 = Monday (default: 0)
 */
export function endOfWeek(date: Date, weekStartsOn: 0 | 1 = 0): Date {
  const d = startOfWeek(date, weekStartsOn)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Get the start of a day (00:00:00)
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get the end of a day (23:59:59)
 */
export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

/**
 * Add weeks to a date
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7)
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/**
 * Add hours to a date
 */
export function addHours(date: Date, hours: number): Date {
  const d = new Date(date)
  d.setHours(d.getHours() + hours)
  return d
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() + minutes)
  return d
}

// ============================================================================
// Date Comparison
// ============================================================================

/**
 * Check if two dates are the same day
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * Check if two dates are in the same month
 */
export function isSameMonth(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth()
  )
}

/**
 * Check if two dates are in the same week
 */
export function isSameWeek(a: Date, b: Date, weekStartsOn: 0 | 1 = 0): boolean {
  const startA = startOfWeek(a, weekStartsOn)
  const startB = startOfWeek(b, weekStartsOn)
  return isSameDay(startA, startB)
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  return date < new Date()
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  return date > new Date()
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/**
 * Check if a date is within a range (inclusive)
 */
export function isWithinInterval(
  date: Date,
  interval: { start: Date; end: Date }
): boolean {
  return date >= interval.start && date <= interval.end
}

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Format date as "Month Year" (e.g., "January 2026")
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/**
 * Format date as "Month Day" (e.g., "Jan 5")
 */
export function formatMonthDay(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Format date as full date (e.g., "Monday, January 5, 2026")
 */
export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Format date as short date (e.g., "1/5/2026")
 */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Format date for input[type="date"] (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format time as "HH:mm" (24-hour)
 */
export function formatTime24(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Format time as "h:mm AM/PM"
 */
export function formatTime12(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Format hour as "h AM/PM" (e.g., "9 AM")
 */
export function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour} ${period}`
}

/**
 * Format a time range (e.g., "9:00 AM - 10:30 AM")
 */
export function formatTimeRange(start: Date, end: Date): string {
  const startStr = formatTime12(start)
  const endStr = formatTime12(end)
  return `${startStr} - ${endStr}`
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (Math.abs(diffDay) >= 1) {
    return rtf.format(diffDay, 'day')
  } else if (Math.abs(diffHour) >= 1) {
    return rtf.format(diffHour, 'hour')
  } else if (Math.abs(diffMin) >= 1) {
    return rtf.format(diffMin, 'minute')
  } else {
    return rtf.format(diffSec, 'second')
  }
}

/**
 * Format date for header display (e.g., "Monday, January 6")
 */
export function formatHeaderDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
}

// ============================================================================
// Date Parsing
// ============================================================================

/**
 * Parse a date string in YYYY-MM-DD format
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Parse a time string in HH:mm format and apply to a date
 */
export function parseTimeString(timeStr: string, baseDate: Date = new Date()): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const result = new Date(baseDate)
  result.setHours(hours, minutes, 0, 0)
  return result
}

/**
 * Combine a date and time string into a single Date
 */
export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

// ============================================================================
// Date Calculations
// ============================================================================

/**
 * Get the number of days in a month
 */
export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/**
 * Get the week number of the year (ISO week)
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/**
 * Get the difference in days between two dates
 */
export function differenceInDays(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((a.getTime() - b.getTime()) / msPerDay)
}

/**
 * Get the difference in hours between two dates
 */
export function differenceInHours(a: Date, b: Date): number {
  const msPerHour = 60 * 60 * 1000
  return Math.floor((a.getTime() - b.getTime()) / msPerHour)
}

/**
 * Get the difference in minutes between two dates
 */
export function differenceInMinutes(a: Date, b: Date): number {
  const msPerMinute = 60 * 1000
  return Math.floor((a.getTime() - b.getTime()) / msPerMinute)
}

// ============================================================================
// Calendar Grid Helpers
// ============================================================================

/**
 * Get all days for a month view calendar grid
 * Includes overflow days from prev/next months to fill 6 weeks
 */
export function getMonthViewDays(date: Date): Date[] {
  const days: Date[] = []
  const year = date.getFullYear()
  const month = date.getMonth()

  // First day of the month
  const firstDay = new Date(year, month, 1)
  const startDayOfWeek = firstDay.getDay()

  // Start from the first cell (may be in previous month)
  const startDate = addDays(firstDay, -startDayOfWeek)

  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    days.push(addDays(startDate, i))
  }

  return days
}

/**
 * Get all days for a week view
 */
export function getWeekViewDays(date: Date, weekStartsOn: 0 | 1 = 0): Date[] {
  const days: Date[] = []
  const start = startOfWeek(date, weekStartsOn)

  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i))
  }

  return days
}

/**
 * Get day names for calendar header
 */
export function getDayNames(weekStartsOn: 0 | 1 = 0): string[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (weekStartsOn === 1) {
    return [...days.slice(1), days[0]]
  }

  return days
}

/**
 * Get full day names
 */
export function getFullDayNames(weekStartsOn: 0 | 1 = 0): string[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  if (weekStartsOn === 1) {
    return [...days.slice(1), days[0]]
  }

  return days
}
