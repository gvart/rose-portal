<template>
  <div class="calendar-header">
    <!-- Navigation Controls -->
    <div class="nav-controls">
      <button
        v-haptic:light
        class="nav-btn"
        @click="$emit('previous')"
        aria-label="Previous"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="nav-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        v-haptic:light
        class="today-btn"
        :class="{ 'today-btn--active': isToday }"
        @click="$emit('today')"
      >
        Today
      </button>

      <button
        v-haptic:light
        class="nav-btn"
        @click="$emit('next')"
        aria-label="Next"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="nav-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>

    <!-- Title -->
    <h2 class="header-title">{{ title }}</h2>

    <!-- View Toggle and Create Button -->
    <div class="header-actions">
      <!-- View Toggle (Desktop) -->
      <div class="view-toggle desktop-only">
        <button
          v-for="view in viewOptions"
          :key="view.id"
          v-haptic:light
          class="view-btn"
          :class="{ 'view-btn--active': currentView === view.id }"
          @click="$emit('view-change', view.id)"
        >
          {{ view.label }}
        </button>
      </div>

      <!-- View Toggle (Mobile - compact) -->
      <div class="view-toggle mobile-only">
        <button
          v-for="view in viewOptions"
          :key="view.id"
          v-haptic:light
          class="view-btn view-btn--compact"
          :class="{ 'view-btn--active': currentView === view.id }"
          @click="$emit('view-change', view.id)"
          :aria-label="`Switch to ${view.label} view`"
        >
          {{ view.shortLabel }}
        </button>
      </div>

      <!-- Create Event Button -->
      <button
        v-haptic:medium
        class="create-btn"
        @click="$emit('create-event')"
        aria-label="Create event"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="create-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span class="create-label">Event</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarView } from '../types/calendar'
import { VIEW_OPTIONS } from '../types/calendar'

defineProps<{
  title: string
  currentView: CalendarView
  isToday: boolean
  loading: boolean
}>()

defineEmits<{
  previous: []
  next: []
  today: []
  'view-change': [view: CalendarView]
  'create-event': []
}>()

const viewOptions = VIEW_OPTIONS
</script>

<style scoped>
.calendar-header {
  @apply flex items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-md mb-4;
  flex-wrap: wrap;
}

/* Navigation Controls */
.nav-controls {
  @apply flex items-center gap-2;
}

.nav-btn {
  @apply flex items-center justify-center w-10 h-10 rounded-lg
         text-gray-600 hover:bg-gray-100 hover:text-gray-800
         transition-all duration-150 active:scale-95;
}

.nav-icon {
  @apply w-5 h-5;
}

.today-btn {
  @apply px-4 py-2 font-semibold text-gray-700 bg-gray-100
         rounded-lg hover:bg-gray-200 transition-all duration-150
         active:scale-95;
  min-height: 40px;
}

.today-btn--active {
  @apply bg-indigo-100 text-indigo-700 hover:bg-indigo-200;
}

/* Title */
.header-title {
  @apply text-xl font-bold text-gray-800 text-center flex-1;
  min-width: 200px;
}

/* Actions */
.header-actions {
  @apply flex items-center gap-3;
}

/* View Toggle */
.view-toggle {
  @apply flex bg-gray-100 rounded-lg p-1;
}

.view-btn {
  @apply px-4 py-2 font-semibold text-gray-600 rounded-md
         transition-all duration-150;
  min-height: 36px;
}

.view-btn--compact {
  @apply px-3;
}

.view-btn:hover:not(.view-btn--active) {
  @apply text-gray-800;
}

.view-btn--active {
  @apply bg-white text-indigo-600 shadow-sm;
}

/* Create Button */
.create-btn {
  @apply flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white
         font-semibold rounded-lg hover:bg-indigo-700
         transition-all duration-150 active:scale-95 shadow-md;
  min-height: 40px;
}

.create-icon {
  @apply w-5 h-5;
}

.create-label {
  @apply hidden sm:inline;
}

/* Responsive */
.desktop-only {
  @apply hidden md:flex;
}

.mobile-only {
  @apply flex md:hidden;
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .calendar-header {
    @apply flex-col gap-3 p-3;
  }

  .nav-controls {
    @apply order-2 w-full justify-center;
  }

  .header-title {
    @apply order-1 w-full text-lg;
    min-width: auto;
  }

  .header-actions {
    @apply order-3 w-full justify-center;
  }

  .today-btn {
    @apply px-3 text-sm;
  }

  .view-btn {
    @apply px-3 py-1.5 text-sm;
  }

  .create-btn {
    @apply px-3;
  }
}
</style>
