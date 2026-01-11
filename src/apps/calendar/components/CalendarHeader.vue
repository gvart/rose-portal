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

    <!-- Username Filter -->
    <div v-if="availableUsernames.length > 0" class="username-filter">
      <button
        v-haptic:light
        class="filter-btn"
        :class="{ 'filter-btn--active': selectedUsernames.length > 0 }"
        @click.stop="showFilterDropdown = !showFilterDropdown"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="filter-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
        <span v-if="selectedUsernames.length === 0" class="filter-label">Filter</span>
        <span v-else class="filter-label">{{ selectedUsernames.length }} user{{ selectedUsernames.length > 1 ? 's' : '' }}</span>
      </button>

      <!-- Filter Dropdown -->
      <Transition name="dropdown">
        <div v-if="showFilterDropdown" class="filter-dropdown" @click.stop>
          <div class="filter-header">
            <span class="filter-dropdown-title">Filter by Creator</span>
            <button
              v-if="selectedUsernames.length > 0"
              v-haptic:light
              class="clear-filter-btn"
              @click="$emit('clear-filter')"
            >
              Clear
            </button>
          </div>
          <div class="filter-options">
            <label
              v-for="username in availableUsernames"
              :key="username"
              class="filter-option"
            >
              <input
                type="checkbox"
                :checked="selectedUsernames.includes(username)"
                @change="$emit('toggle-filter', username)"
                class="filter-checkbox"
              />
              <span class="filter-option-label">{{ username }}</span>
            </label>
          </div>
        </div>
      </Transition>
    </div>

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
import { ref, onMounted, onUnmounted } from 'vue'
import type { CalendarView } from '../types/calendar'
import { VIEW_OPTIONS } from '../types/calendar'

defineProps<{
  title: string
  currentView: CalendarView
  isToday: boolean
  loading: boolean
  availableUsernames: string[]
  selectedUsernames: string[]
}>()

defineEmits<{
  previous: []
  next: []
  today: []
  'view-change': [view: CalendarView]
  'create-event': []
  'toggle-filter': [username: string]
  'clear-filter': []
}>()

const viewOptions = VIEW_OPTIONS
const showFilterDropdown = ref(false)

// Close dropdown when clicking outside
function handleClickOutside() {
  showFilterDropdown.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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

/* Username Filter */
.username-filter {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-14);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 36px;
}

.filter-btn:active {
  transform: scale(0.95);
  background: var(--color-bg-tertiary);
}

.filter-btn--active {
  background: var(--color-info-bg);
  color: var(--color-info-solid);
}

.filter-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.filter-label {
  white-space: nowrap;
}

.filter-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  min-width: 240px;
  background: var(--color-bg-primary);
  border: var(--depth-2-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--depth-3-shadow);
  z-index: 100;
  overflow: hidden;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--depth-1-border);
  background: var(--color-bg-secondary);
}

.filter-dropdown-title {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--font-size-14);
}

.clear-filter-btn {
  font-size: var(--font-size-13);
  color: var(--color-info-solid);
  font-weight: var(--font-weight-semibold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.clear-filter-btn:active {
  background: var(--color-info-bg);
}

.filter-options {
  max-height: 300px;
  overflow-y: auto;
  padding: var(--space-2);
}

.filter-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-in-out);
}

.filter-option:hover {
  background: var(--color-bg-secondary);
}

.filter-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-info-solid);
}

.filter-option-label {
  font-size: var(--font-size-14);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--duration-fast) var(--ease-in-out);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .filter-dropdown {
    left: 0;
    right: 0;
    min-width: auto;
  }

  .username-filter {
    order: 4;
    width: 100%;
    justify-content: center;
  }
}
</style>
