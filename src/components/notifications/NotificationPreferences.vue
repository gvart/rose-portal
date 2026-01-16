<template>
  <div class="notification-preferences">
    <h3 class="preferences-title">Notification Types</h3>
    <p class="preferences-description">Choose which notifications you want to receive</p>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading preferences...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p class="error-text">{{ error }}</p>
      <button class="btn-retry" @click="fetchPreferences">
        Retry
      </button>
    </div>

    <!-- Preferences List -->
    <div v-else class="preferences-list">
      <div
        v-for="pref in preferences"
        :key="pref.type"
        class="preference-item"
      >
        <div class="preference-info">
          <label class="preference-label">{{ pref.label }}</label>
          <p class="preference-description">{{ pref.description }}</p>
        </div>

        <button
          role="switch"
          :aria-checked="pref.enabled"
          class="toggle-switch"
          :class="{ active: pref.enabled }"
         
          @click="togglePreference(pref)"
        >
          <span class="toggle-slider" :class="{ active: pref.enabled }"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiClients } from '@/services/apiClient'
import { useToast } from '@/composables/useToast'

interface NotificationPreference {
  type: string
  label: string
  description: string
  enabled: boolean
}

const preferences = ref<NotificationPreference[]>([
  {
    type: 'CALENDAR_CREATED',
    label: 'Calendar Events Created',
    description: 'Notify when someone creates a new event',
    enabled: true
  },
  {
    type: 'CALENDAR_UPDATED',
    label: 'Calendar Events Updated',
    description: 'Notify when someone updates an event',
    enabled: true
  },
  {
    type: 'CALENDAR_DELETED',
    label: 'Calendar Events Deleted',
    description: 'Notify when someone deletes an event',
    enabled: true
  },
  {
    type: 'CALENDAR_REMINDER',
    label: 'Calendar Reminders',
    description: 'Remind before events start (15min, 1hr, 1 day)',
    enabled: true
  },
  {
    type: 'CHORE_ASSIGNED',
    label: 'Chore Assignments',
    description: 'Notify when a chore is assigned to you',
    enabled: true
  },
  {
    type: 'CHORE_STATUS_CHANGED',
    label: 'Chore Status Changes',
    description: 'Notify when someone changes a chore status',
    enabled: true
  }
])

const loading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

async function fetchPreferences() {
  loading.value = true
  error.value = null

  try {
    const { data } = await apiClients.notifications.get('/preferences')

    // Update preferences with backend data
    if (Array.isArray(data)) {
      data.forEach((backendPref: any) => {
        const pref = preferences.value.find(p => p.type === backendPref.type)
        if (pref) {
          pref.enabled = backendPref.enabled
        }
      })
    }

    console.log('✅ Fetched notification preferences:', data)
  } catch (err) {
    console.error('❌ Failed to fetch preferences:', err)
    error.value = 'Failed to load preferences. Please try again.'
  } finally {
    loading.value = false
  }
}

async function togglePreference(pref: NotificationPreference) {
  // Save old value for rollback
  const oldValue = pref.enabled

  // Optimistic update
  pref.enabled = !pref.enabled

  try {
    // Send update to backend
    await apiClients.notifications.put('/preferences', {
      type: pref.type,
      enabled: pref.enabled
    })

    console.log(`✅ Updated preference ${pref.type}: ${pref.enabled}`)
  } catch (err) {
    console.error('❌ Failed to update preference:', err)

    // Rollback on error
    pref.enabled = oldValue

    // Show error message
    toast.error(`Failed to update ${pref.label}. Please try again.`)
  }
}

onMounted(() => {
  fetchPreferences()
})
</script>

<style scoped>
.notification-preferences {
  margin-top: var(--space-4);
  padding: 0;
  background: transparent;
  border: none;
}

.preferences-title {
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.preferences-description {
  font-size: var(--font-size-12);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  gap: var(--space-3);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border-primary);
  border-top-color: var(--color-accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  font-size: var(--font-size-13);
  color: var(--color-text-secondary);
}

.error-state {
  padding: var(--space-6);
  text-align: center;
}

.error-text {
  font-size: var(--font-size-14);
  color: var(--color-error-text);
  margin-bottom: var(--space-4);
}

.btn-retry {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  color: white;
  background: var(--color-accent-primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.btn-retry:active {
  transform: scale(0.96);
}

.preferences-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.preference-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-border-primary);
}

.preference-item:last-child {
  border-bottom: none;
}

.preference-info {
  flex: 1;
}

.preference-label {
  display: block;
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.preference-description {
  font-size: var(--font-size-11);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-primary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  flex-shrink: 0;
}

.toggle-switch.active {
  background: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
}

.toggle-switch:active:not(:disabled) {
  transform: scale(0.96);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.toggle-slider.active {
  transform: translateX(20px);
}
</style>
