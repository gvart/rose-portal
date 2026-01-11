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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}

/* Navigation Controls */
.nav-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.nav-btn:active {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  transform: scale(0.95);
}

.nav-icon {
  width: 20px;
  height: 20px;
}

.today-btn {
  padding: var(--space-2) var(--space-4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 40px;
}

.today-btn:active:not(.today-btn--active) {
  transform: scale(0.95);
  background: var(--color-bg-tertiary);
}

.today-btn--active {
  background: var(--color-info-bg);
  color: var(--color-info-solid);
}

/* Title */
.header-title {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-align: center;
  flex: 1;
  min-width: 200px;
}

/* Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* View Toggle */
.view-toggle {
  display: flex;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-1);
}

.view-btn {
  padding: var(--space-2) var(--space-4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 36px;
}

.view-btn--compact {
  padding-left: var(--space-3);
  padding-right: var(--space-3);
}

.view-btn:active:not(.view-btn--active) {
  color: var(--color-text-primary);
}

.view-btn--active {
  background: var(--color-bg-primary);
  color: var(--color-info-solid);
  box-shadow: var(--depth-1-shadow);
}

/* Create Button */
.create-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-info-solid);
  color: white;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  box-shadow: var(--depth-2-shadow);
  min-height: 40px;
}

.create-btn:active {
  transform: scale(0.95);
  background: #4f46e5;
}

.create-icon {
  width: 20px;
  height: 20px;
}

.create-label {
  display: none;
}

@media (min-width: 640px) {
  .create-label {
    display: inline;
  }
}

/* Responsive */
.desktop-only {
  display: none;
}

@media (min-width: 768px) {
  .desktop-only {
    display: flex;
  }
}

.mobile-only {
  display: flex;
}

@media (min-width: 768px) {
  .mobile-only {
    display: none;
  }
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .calendar-header {
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-3);
  }

  .nav-controls {
    order: 2;
    width: 100%;
    justify-content: center;
  }

  .header-title {
    order: 1;
    width: 100%;
    font-size: var(--font-size-18);
    min-width: auto;
  }

  .header-actions {
    order: 3;
    width: 100%;
    justify-content: center;
  }

  .today-btn {
    padding-left: var(--space-3);
    padding-right: var(--space-3);
    font-size: var(--font-size-14);
  }

  .view-btn {
    padding: var(--space-1) var(--space-3);
    font-size: var(--font-size-14);
  }

  .create-btn {
    padding-left: var(--space-3);
    padding-right: var(--space-3);
  }
}
</style>
