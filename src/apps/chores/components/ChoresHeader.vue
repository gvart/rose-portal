<template>
  <div class="chores-header">
    <!-- Filters Section -->
    <div class="chores-header-filters">
      <!-- Priority Filters -->
      <div class="filter-group">
        <span class="filter-label">Priority:</span>
        <button
          v-for="priority in priorities"
          :key="priority.value"
          :class="[
            'filter-chip',
            { 'filter-chip-active': selectedPriorities.includes(priority.value) }
          ]"
          :style="{
            '--chip-color': priority.color,
            '--chip-bg': priority.bgColor,
            '--chip-text': priority.textColor
          }"
          @click="$emit('toggle-priority', priority.value)"
        >
          {{ priority.label }}
        </button>
      </div>

      <!-- Assignee Filter -->
      <div class="filter-group">
        <span class="filter-label">Assigned to:</span>
        <select
          :value="selectedAssignee ?? ''"
          class="filter-select"
          @change="handleAssigneeChange"
        >
          <option value="">All</option>
          <option v-for="user in availableUsers" :key="user.id" :value="user.id">
            {{ user.username }}
          </option>
        </select>
      </div>

      <!-- Clear Filters -->
      <button
        v-if="hasActiveFilters"
        class="filter-clear"
        @click="$emit('clear-filters')"
      >
        Clear Filters
      </button>
    </div>

    <!-- Create Button -->
    <button class="create-button" :disabled="loading" @click="$emit('create')">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
      <span>Create Chore</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User, ChorePriority } from '../types/chores'
import { PRIORITY_CONFIGS } from '../types/chores'

interface Props {
  loading: boolean
  availableUsers: User[]
  selectedPriorities: ChorePriority[]
  selectedAssignee: number | null
  hasActiveFilters: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  create: []
  'toggle-priority': [priority: ChorePriority]
  'select-assignee': [userId: number | null]
  'clear-filters': []
}>()

const priorities = computed(() => Object.values(PRIORITY_CONFIGS))

function handleAssigneeChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  const value = target.value === '' ? null : parseInt(target.value, 10)
  emit('select-assignee', value)
}
</script>

<style scoped>
.chores-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  flex-wrap: wrap;
}

.chores-header-filters {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
}

.filter-chip {
  padding: 0.375rem 0.75rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-chip:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.filter-chip-active {
  background: var(--chip-bg);
  border-color: var(--chip-color);
  color: var(--chip-text);
}

.filter-select {
  padding: 0.375rem 0.75rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:hover {
  border-color: #d1d5db;
}

.filter-select:focus {
  outline: none;
  border-color: #EC4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.filter-clear {
  padding: 0.375rem 0.75rem;
  background: #fee2e2;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #991b1b;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-clear:hover {
  background: #fecaca;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #EC4899;
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.create-button:hover:not(:disabled) {
  background: #db2777;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.create-button:active:not(:disabled) {
  transform: translateY(0);
}

.create-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.create-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

@media (max-width: 768px) {
  .chores-header {
    flex-direction: column;
    align-items: stretch;
  }

  .chores-header-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    width: 100%;
  }

  .create-button {
    display: none; /* Hide on mobile, use FAB instead */
  }
}
</style>
