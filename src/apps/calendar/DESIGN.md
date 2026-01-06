# ROSE Calendar App - UI/UX Design Specification

## Table of Contents
1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Color Scheme](#color-scheme)
4. [Component Architecture](#component-architecture)
5. [Wireframes](#wireframes)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Interaction Patterns](#interaction-patterns)
9. [Responsive Behavior](#responsive-behavior)
10. [Accessibility](#accessibility)

---

## Overview

The Calendar miniapp provides a Google Calendar-like experience for managing events within the ROSE portal. It follows the established design patterns from existing apps (plant-monitor, recipe, system-monitor) while introducing calendar-specific interactions.

### Key Features
- **Three View Modes**: Month, Week, and Day views
- **Event Management**: Create, edit, and delete events
- **Intuitive Navigation**: Easy navigation between time periods
- **Touch-Friendly**: Optimized for both mobile and desktop interactions
- **Real-time Updates**: Seamless sync with backend API

---

## Design Principles

Following the ROSE portal design system:

1. **Consistency**: Uses AppLayout wrapper, similar card styles, and button patterns
2. **Touch-First**: All interactive elements are minimum 44x44px
3. **Visual Hierarchy**: Clear distinction between navigation, calendar grid, and events
4. **Smooth Transitions**: 200-300ms transitions for view changes
5. **Haptic Feedback**: Using v-haptic directive for touch interactions

---

## Color Scheme

### Theme Color
```
Primary Calendar Color: #6366F1 (Indigo-500)
```

This indigo color provides good contrast with other apps:
- Recipe: #10b981 (Emerald)
- System Monitor: #3b82f6 (Blue)
- Plant Monitor: #22C55E (Green)

### Event Colors (User-selectable palette)
```css
--event-default: #6366F1;    /* Indigo - default */
--event-red: #EF4444;        /* Red - urgent/important */
--event-orange: #F97316;     /* Orange - work */
--event-yellow: #EAB308;     /* Yellow - reminders */
--event-green: #22C55E;      /* Green - personal */
--event-blue: #3B82F6;       /* Blue - meetings */
--event-purple: #A855F7;     /* Purple - special */
--event-pink: #EC4899;       /* Pink - social */
```

### UI Colors (from existing design system)
```css
--bg-primary: #F9FAFB;       /* gray-50 */
--bg-card: #FFFFFF;          /* white */
--text-primary: #1F2937;     /* gray-800 */
--text-secondary: #6B7280;   /* gray-500 */
--border-color: #E5E7EB;     /* gray-200 */
--today-highlight: #FEF3C7;  /* amber-100 */
--weekend-bg: #F3F4F6;       /* gray-100 */
```

---

## Component Architecture

```
portal/src/apps/calendar/
|-- CalendarApp.vue              # Main app component
|-- components/
|   |-- CalendarHeader.vue       # Navigation and view controls
|   |-- CalendarGrid.vue         # Shared grid wrapper
|   |-- MonthView.vue            # Month calendar grid
|   |-- WeekView.vue             # Week view with time slots
|   |-- DayView.vue              # Single day with time slots
|   |-- EventCard.vue            # Event display component
|   |-- EventModal.vue           # Create/Edit event modal
|   |-- TimeSlot.vue             # Time slot for week/day views
|   |-- MiniCalendar.vue         # Small month picker (sidebar)
|   |-- DatePicker.vue           # Date selection dropdown
|   |-- ViewToggle.vue           # Month/Week/Day toggle
|-- stores/
|   |-- calendarStore.ts         # Pinia store for calendar state
|-- services/
|   |-- calendarApi.ts           # API service layer
|-- types/
|   |-- calendar.ts              # TypeScript interfaces
|-- composables/
|   |-- useCalendarNavigation.ts # Navigation logic
|   |-- useDateUtils.ts          # Date formatting utilities
```

---

## Wireframes

### 1. Month View (Default)

```
+------------------------------------------------------------------+
|  [<]  [Today]  [>]     January 2026        [Month|Week|Day]  [+] |
+------------------------------------------------------------------+
|  Sun    Mon    Tue    Wed    Thu    Fri    Sat                   |
+--------+-------+-------+-------+-------+-------+-------+         |
|   28   |  29   |  30   |  31   |   1   |   2   |   3   |         |
|        |       |       |       |       |       |       |         |
+--------+-------+-------+-------+-------+-------+-------+         |
|    4   |   5   |   6   |   7   |   8   |   9   |  10   |         |
|        |[Event]|       |[Event]|       |       |       |         |
|        |[Ev..] |       |       |       |       |       |         |
+--------+-------+-------+-------+-------+-------+-------+         |
|   11   |  12   |  13   |  14   |  15   |  16   |  17   |         |
|        |       |       |       |       |       |       |         |
+--------+-------+-------+-------+-------+-------+-------+         |
|   18   |  19   |  20   |  21   |  22   |  23   |  24   |         |
|        |       |       |       |       |       |       |         |
+--------+-------+-------+-------+-------+-------+-------+         |
|   25   |  26   |  27   |  28   |  29   |  30   |  31   |         |
|        |       |       |       |       |       |       |         |
+--------+-------+-------+-------+-------+-------+-------+         |
```

**Month View Details:**
- Each day cell is clickable to create a new event or view day
- Events show as colored pills with truncated names
- "More" indicator (+N) when events overflow
- Today is highlighted with amber background
- Weekend columns have subtle gray background
- Days from other months are grayed out

### 2. Week View

```
+------------------------------------------------------------------+
|  [<]  [Today]  [>]    Jan 5 - 11, 2026     [Month|Week|Day]  [+] |
+------------------------------------------------------------------+
|         | Sun 5 | Mon 6 | Tue 7 | Wed 8 | Thu 9 | Fri10 | Sat11 |
+---------+-------+-------+-------+-------+-------+-------+-------+
| All Day |       |[Event]|       |       |       |       |       |
+---------+-------+-------+-------+-------+-------+-------+-------+
|  8 AM   |       |       |       |       |       |       |       |
+---------+-------+-------+-------+-------+-------+-------+-------+
|  9 AM   |       |+------+       |       |       |       |       |
|         |       ||Meet- |       |       |       |       |       |
+---------+-------+|ing   |-------+-------+-------+-------+-------+
| 10 AM   |       |+------+       |       |       |       |       |
+---------+-------+-------+-------+-------+-------+-------+-------+
| 11 AM   |       |       |       |+------+       |       |       |
|         |       |       |       ||Lunch |       |       |       |
+---------+-------+-------+-------++------+-------+-------+-------+
| 12 PM   |       |       |       |       |       |       |       |
+---------+-------+-------+-------+-------+-------+-------+-------+
|  ...    |       |       |       |       |       |       |       |
```

**Week View Details:**
- Time column on left (scrollable, 24h or business hours option)
- All-day events row at top
- Events span their actual duration vertically
- Current time indicator (red line)
- Click on empty slot to create event at that time
- Drag event edges to resize (desktop)

### 3. Day View

```
+------------------------------------------------------------------+
|  [<]  [Today]  [>]   Monday, January 5, 2026  [Month|Week|Day][+]|
+------------------------------------------------------------------+
| All Day Events:                                                   |
| [  New Year Holiday  ] [  Team Building  ]                       |
+------------------------------------------------------------------+
|  7 AM  |                                                         |
+---------+---------------------------------------------------------+
|  8 AM  |                                                         |
+---------+---------------------------------------------------------+
|  9 AM  | +-----------------------------------------------------+ |
|        | |  Team Standup                                       | |
|        | |  9:00 - 9:30 AM                                     | |
+---------+-|----------------------------------------------------|-+
| 10 AM  | +-----------------------------------------------------+ |
+---------+---------------------------------------------------------+
| 11 AM  |                                                         |
+---------+---------------------------------------------------------+
| 12 PM  | +-----------------------------------------------------+ |
|        | |  Lunch with Sarah                                   | |
| 1 PM   | |  12:00 - 1:30 PM                                    | |
|        | +-----------------------------------------------------+ |
+---------+---------------------------------------------------------+
|  2 PM  |                                                         |
+---------+---------------------------------------------------------+
```

**Day View Details:**
- Larger time slots for easier viewing
- All-day events section at top
- Events show full details (title, time, description preview)
- Click event to edit
- Click empty space to create new event

### 4. Event Creation/Edit Modal

```
+------------------------------------------------------------------+
|                                                           [X]    |
|  Create Event                                                    |
+------------------------------------------------------------------+
|                                                                  |
|  Event Name                                                      |
|  +------------------------------------------------------------+ |
|  |  Team Meeting                                              | |
|  +------------------------------------------------------------+ |
|                                                                  |
|  Start                              End                          |
|  +---------------------------+     +---------------------------+ |
|  | Jan 5, 2026  |  9:00 AM   |     | Jan 5, 2026  | 10:00 AM  | |
|  +---------------------------+     +---------------------------+ |
|                                                                  |
|  [ ] All Day Event                                               |
|                                                                  |
|  Color                                                           |
|  [O] [O] [O] [O] [O] [O] [O] [O]                                 |
|   ^                                                              |
|  Indigo  Red  Orange Yellow Green Blue Purple Pink               |
|                                                                  |
|  +------------------------------------------------------------+ |
|  |                          Cancel                            | |
|  +------------------------------------------------------------+ |
|  +------------------------------------------------------------+ |
|  |                       Save Event                           | |
|  +------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

**Modal Details:**
- Teleported to body for proper z-index stacking
- Click outside to cancel (with unsaved changes warning)
- Date and time pickers are touch-friendly
- All-day toggle hides time inputs
- Color picker for visual categorization
- Delete button appears only when editing existing event

### 5. Mobile Month View (Compact)

```
+--------------------------------+
| [<] January 2026 [>]       [+] |
+--------------------------------+
|  S   M   T   W   T   F   S    |
+----+---+---+---+---+---+---+  |
| 28 | 29| 30| 31| 1 | 2 | 3 |  |
+----+---+---+---+---+---+---+  |
|  4 |  5|  6|  7|  8|  9| 10|  |
|    | * |   | * |   |   |   |  |
+----+---+---+---+---+---+---+  |
| 11 | 12| 13| 14| 15| 16| 17|  |
+----+---+---+---+---+---+---+  |
| 18 | 19| 20| 21| 22| 23| 24|  |
+----+---+---+---+---+---+---+  |
| 25 | 26| 27| 28| 29| 30| 31|  |
+----+---+---+---+---+---+---+  |
+--------------------------------+
| Monday, Jan 5                  |
| +----------------------------+ |
| | 9:00 AM  Team Standup      | |
| +----------------------------+ |
| | 12:00 PM Lunch with Sarah  | |
| +----------------------------+ |
+--------------------------------+
```

**Mobile Adaptations:**
- Dots indicate days with events (space-saving)
- Selected day shows event list below
- Swipe left/right to change months
- Tap day to select and show events
- View toggle becomes dropdown menu

---

## State Management

### Pinia Store Structure (calendarStore.ts)

```typescript
interface CalendarState {
  // View State
  currentView: 'month' | 'week' | 'day'
  selectedDate: Date
  focusedDate: Date  // For keyboard navigation

  // Events
  events: CalendarEvent[]
  selectedEvent: CalendarEvent | null

  // UI State
  loading: boolean
  error: string | null
  showEventModal: boolean
  modalMode: 'create' | 'edit'

  // Cache
  fetchedRanges: DateRange[]  // Track which date ranges we've fetched
}

interface CalendarEvent {
  id: number
  eventName: string
  from: Date
  to: Date
  color?: string
  isAllDay?: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: {
    id: string
    name: string
  }
}

// Actions
- fetchEventsForRange(from: Date, to: Date)
- createEvent(event: CreateEventPayload)
- updateEvent(id: number, event: UpdateEventPayload)
- deleteEvent(id: number)
- setView(view: 'month' | 'week' | 'day')
- navigateToDate(date: Date)
- goToToday()
- navigatePrevious()
- navigateNext()
- selectEvent(event: CalendarEvent)
- clearSelection()
```

### Store Implementation Highlights

```typescript
// Smart date range fetching - avoid duplicate API calls
async function fetchEventsForRange(from: Date, to: Date) {
  // Check if range is already fetched
  if (isRangeCached(from, to)) return

  loading.value = true
  try {
    const events = await calendarApi.getEvents(from, to)
    // Merge with existing events, avoiding duplicates
    mergeEvents(events)
    addFetchedRange(from, to)
  } catch (e) {
    error.value = 'Failed to load events'
  } finally {
    loading.value = false
  }
}

// Computed getters for different views
const monthEvents = computed(() => {
  const start = startOfMonth(selectedDate.value)
  const end = endOfMonth(selectedDate.value)
  return events.value.filter(e =>
    isWithinInterval(e.from, { start, end }) ||
    isWithinInterval(e.to, { start, end })
  )
})

const weekEvents = computed(() => {
  const start = startOfWeek(selectedDate.value)
  const end = endOfWeek(selectedDate.value)
  return events.value.filter(e =>
    isWithinInterval(e.from, { start, end }) ||
    isWithinInterval(e.to, { start, end })
  )
})

const dayEvents = computed(() => {
  return events.value.filter(e =>
    isSameDay(e.from, selectedDate.value) ||
    isSameDay(e.to, selectedDate.value) ||
    (e.from < selectedDate.value && e.to > selectedDate.value)
  )
})
```

---

## API Integration

### API Service (calendarApi.ts)

```typescript
import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT } from '@/config/api'
import type { CalendarEvent, CreateEventRequest } from '../types/calendar'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/calendar`,
  timeout: API_TIMEOUT
})

export async function getEvents(from: Date, to: Date): Promise<CalendarEvent[]> {
  const response = await api.get<CalendarEvent[]>('/events', {
    params: {
      from: from.toISOString(),
      to: to.toISOString()
    }
  })
  return response.data.map(transformEvent)
}

export async function createEvent(event: CreateEventRequest): Promise<CalendarEvent> {
  const response = await api.post<CalendarEvent>('/events', {
    eventName: event.eventName,
    from: event.from.toISOString(),
    to: event.to.toISOString()
  })
  return transformEvent(response.data)
}

export async function updateEvent(id: number, event: CreateEventRequest): Promise<CalendarEvent> {
  const response = await api.put<CalendarEvent>(`/events/${id}`, {
    eventName: event.eventName,
    from: event.from.toISOString(),
    to: event.to.toISOString()
  })
  return transformEvent(response.data)
}

export async function deleteEvent(id: number): Promise<void> {
  await api.delete(`/events/${id}`)
}

// Transform API response to internal format
function transformEvent(apiEvent: any): CalendarEvent {
  return {
    ...apiEvent,
    from: new Date(apiEvent.from),
    to: new Date(apiEvent.to),
    createdAt: new Date(apiEvent.createdAt),
    updatedAt: new Date(apiEvent.updatedAt)
  }
}
```

---

## Interaction Patterns

### 1. Event Creation

**Method 1: Quick Create (Click on empty slot)**
1. User clicks/taps on a day cell (month) or time slot (week/day)
2. Modal opens with pre-filled date/time
3. User enters event name and adjusts times if needed
4. Save creates event immediately

**Method 2: FAB Button**
1. User clicks floating "+" button in header
2. Modal opens with current date/time pre-filled
3. User fills in all fields

### 2. Event Editing

1. User clicks/taps on an event
2. Modal opens in edit mode with all fields populated
3. User makes changes
4. "Save" updates the event
5. "Delete" button appears with confirmation dialog

### 3. Navigation

**Keyboard (Desktop):**
- Arrow keys: Navigate days/weeks
- Enter: Select/edit event or create on empty day
- Escape: Close modal, deselect
- T: Go to today
- M/W/D: Switch views

**Touch (Mobile):**
- Swipe left/right: Navigate prev/next period
- Tap: Select day or event
- Long press: Quick create event
- Pinch: Not supported (keeps things simple)

### 4. View Switching

```
[Month] [Week] [Day]  <- Segmented control

Active state: Filled background with white text
Inactive: Transparent with gray text
Transition: 200ms ease-out
```

### 5. Date Navigation

```
[<] [Today] [>]  Month/Week Header

< : Go to previous period
> : Go to next period
Today : Jump to current date (highlighted if not today)
```

---

## Responsive Behavior

### Breakpoints

```css
/* Mobile: < 768px */
/* Tablet: 768px - 1024px */
/* Desktop: > 1024px */
```

### Mobile (< 768px)

**Month View:**
- Compact day cells (just date number)
- Dots indicate events (no text)
- Selected day shows event list below calendar
- View toggle becomes icon-only or dropdown

**Week View:**
- Show 3-day view instead of 7
- Swipe to see more days
- Or: Switch to agenda-style list

**Day View:**
- Full width time slots
- Events stack vertically

**Header:**
- Condensed navigation
- Smaller buttons but still 44px touch targets

### Tablet (768px - 1024px)

**Month View:**
- Full grid visible
- Events show as short pills
- 2-3 events visible per day

**Week View:**
- Full 7-day view
- Narrower time slots

### Desktop (> 1024px)

**All Views:**
- Full functionality
- Mini calendar in sidebar (optional)
- Keyboard shortcuts active
- Hover states for events

---

## Accessibility

### ARIA Landmarks

```html
<main role="main" aria-label="Calendar">
  <nav role="navigation" aria-label="Calendar navigation">
    <!-- Navigation controls -->
  </nav>
  <section role="grid" aria-label="Calendar grid">
    <!-- Calendar cells -->
  </section>
</main>
```

### Keyboard Navigation

- Tab: Move between controls
- Arrow keys: Navigate calendar grid
- Enter/Space: Activate buttons, select dates
- Escape: Close modals

### Screen Reader Support

```html
<!-- Day cell -->
<button
  role="gridcell"
  aria-label="January 5, 2026, Monday, 3 events"
  aria-selected="true"
>
  5
</button>

<!-- Event -->
<article
  role="article"
  aria-label="Team Meeting, January 5, 9:00 AM to 10:00 AM"
>
  <h3>Team Meeting</h3>
  <time datetime="2026-01-05T09:00">9:00 AM</time>
</article>
```

### Color Contrast

- All text meets WCAG 2.1 AA (4.5:1 for normal text)
- Event colors have sufficient contrast with white text
- Focus indicators are clearly visible

### Focus Management

- Modal traps focus when open
- Returns focus to trigger element on close
- Skip links for keyboard users

---

## Animation Specifications

### View Transitions

```css
/* Slide between views */
.view-enter-active,
.view-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.view-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.view-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
```

### Modal Animation

```css
/* Follows existing PlantConfigModal pattern */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .modal-container {
  transform: scale(0.95);
}
```

### Event Hover/Active States

```css
.event-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.event-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.event-card:active {
  transform: scale(0.98);
}
```

---

## Implementation Priority

### Phase 1 (MVP)
1. CalendarApp.vue with AppLayout integration
2. Month view with event display
3. Event creation modal
4. Basic navigation (prev/next/today)
5. Pinia store with CRUD operations
6. API integration

### Phase 2
1. Week view
2. Day view
3. Event editing and deletion
4. Event color selection
5. All-day events support

### Phase 3
1. Mobile optimizations
2. Touch gestures (swipe navigation)
3. Keyboard navigation
4. Mini calendar picker
5. Performance optimizations (virtualization for large event counts)

### Phase 4 (Future)
1. Recurring events
2. Event reminders/notifications
3. Calendar sharing
4. External calendar sync (Google, Apple)
5. Drag-and-drop event moving/resizing

---

## File Templates

The following files should be created:

1. `CalendarApp.vue` - Main component
2. `components/CalendarHeader.vue` - Navigation header
3. `components/MonthView.vue` - Month grid
4. `components/WeekView.vue` - Week grid
5. `components/DayView.vue` - Day view
6. `components/EventCard.vue` - Event display
7. `components/EventModal.vue` - Create/edit modal
8. `stores/calendarStore.ts` - State management
9. `services/calendarApi.ts` - API layer
10. `types/calendar.ts` - TypeScript definitions
11. `composables/useDateUtils.ts` - Date utilities

See individual component specifications in the implementation files.
