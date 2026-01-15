<template>
  <AppLayout title="Settings" theme-color="#6B7280">
    <div class="settings">
      <div class="settings-section">
        <h2 class="section-title">Appearance</h2>

        <div class="setting-item">
          <div class="setting-info">
            <label for="theme-selector" class="setting-label">Theme</label>
            <p class="setting-description">Choose your preferred color scheme</p>
          </div>

          <div class="theme-selector">
            <button
              v-for="theme in themes"
              :key="theme.value"
              :class="['theme-btn', { active: currentTheme === theme.value }]"
              v-haptic:light
              @click="setTheme(theme.value)"
            >
              {{ theme.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h2 class="section-title">Haptic Feedback</h2>

        <div class="setting-item">
          <div class="setting-info">
            <label for="haptic-toggle" class="setting-label">Enable vibration on touch</label>
            <p class="setting-description">Provides tactile feedback when interacting with buttons and controls</p>
            <p v-if="!settingsStore.hapticSupported" class="setting-warning">
              ⚠️ Haptic feedback is not supported on this device
            </p>
          </div>

          <button
            id="haptic-toggle"
            role="switch"
            :aria-checked="settingsStore.hapticEnabled"
            :disabled="!settingsStore.hapticSupported"
            class="toggle-switch"
            :class="{ active: settingsStore.hapticEnabled }"
            v-haptic:medium
            @click="handleToggle"
          >
            <span class="toggle-slider" :class="{ active: settingsStore.hapticEnabled }"></span>
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h2 class="section-title">Screensaver</h2>

        <div class="setting-item">
          <div class="setting-info">
            <label for="screensaver-toggle" class="setting-label">Enable screensaver</label>
            <p class="setting-description">Show particle animation after period of inactivity</p>
          </div>

          <button
            id="screensaver-toggle"
            role="switch"
            :aria-checked="settingsStore.screensaverEnabled"
            class="toggle-switch"
            :class="{ active: settingsStore.screensaverEnabled }"
            v-haptic:medium
            @click="settingsStore.toggleScreensaver"
          >
            <span class="toggle-slider" :class="{ active: settingsStore.screensaverEnabled }"></span>
          </button>
        </div>

        <div v-if="settingsStore.screensaverEnabled" class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Activate after</label>
            <p class="setting-description">Minutes of inactivity before screensaver appears</p>
          </div>

          <div class="timeout-controls">
            <button
              v-haptic:light
              @click="decreaseTimeout"
              class="timeout-btn"
              :disabled="settingsStore.screensaverTimeout <= 1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>

            <span class="timeout-value">{{ settingsStore.screensaverTimeout }} min</span>

            <button
              v-haptic:light
              @click="increaseTimeout"
              class="timeout-btn"
              :disabled="settingsStore.screensaverTimeout >= 60"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="isMobile || isTablet" class="settings-section">
        <h2 class="section-title">Progressive Web App</h2>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Installation Status</label>
            <p class="setting-description">
              {{ isInstalled ? 'Installed on device' : 'Not installed' }}
            </p>
          </div>

          <button
            v-if="isInstallable && !isInstalled"
            v-haptic
            @click="handleInstall"
            class="btn-primary"
          >
            Install App
          </button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Push Notifications</label>
            <p class="setting-description">
              {{ notificationStatus }}
            </p>
            <p v-if="!isNotificationsSupported" class="setting-warning">
              ⚠️ Push notifications are not supported on this device/browser
            </p>
          </div>

          <button
            v-if="!isNotificationsGranted && isNotificationsSupported"
            v-haptic
            @click="handleEnableNotifications"
            class="btn-primary"
            :disabled="isNotificationsDenied || notificationLoading"
          >
            {{ notificationLoading ? 'Enabling...' : 'Enable' }}
          </button>
          <button
            v-else-if="isNotificationsGranted"
            v-haptic
            @click="handleDisableNotifications"
            class="btn-secondary"
            :disabled="notificationLoading"
          >
            {{ notificationLoading ? 'Disabling...' : 'Disable' }}
          </button>
        </div>

        <!-- Notification Preferences (only shown when notifications are enabled) -->
        <NotificationPreferences v-if="isNotificationsGranted" />

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Offline Mode</label>
            <p class="setting-description">
              {{ offlineReady ? 'Ready to work offline' : 'Caching data...' }}
            </p>
          </div>

          <span
            :class="['status-indicator', offlineReady ? 'status-active' : 'status-inactive']"
          />
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Transfer Settings to PWA</label>
            <p class="setting-description">
              {{ pwaDataCopied ? '✓ Link copied! Open it after installing the PWA' : 'Copy a link to transfer your settings when installing the PWA' }}
            </p>
          </div>

          <button
            v-haptic
            @click="handleExportPwaData"
            class="btn-primary"
          >
            {{ pwaDataCopied ? 'Copied!' : 'Copy Link' }}
          </button>
        </div>
      </div>

      <div v-if="isDesktop" class="settings-section">
        <h2 class="section-title">Project Configuration</h2>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Project Key</label>
            <p class="setting-description">
              {{ currentProjectKey || 'Not configured' }}
            </p>
          </div>
          <button
            v-haptic
            @click="showProjectKeyEdit = true"
            class="btn-primary"
          >
            Edit
          </button>
        </div>
      </div>

      <div v-if="isDesktop" class="settings-section">
        <h2 class="section-title">Install on Phone</h2>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">QR Code Setup</label>
            <p class="setting-description">
              Scan this QR code with your phone's camera to open the installation page.
              The page will provide a setup code for the PWA installation.
            </p>
          </div>
        </div>

        <div class="qr-code-container">
          <Qrcode
            :value="installUrl"
            :size="200"
            :dotsOptions="{ type: 'rounded', color: '#10b981' }"
            :cornersSquareOptions="{ type: 'extra-rounded', color: '#10b981' }"
            :cornersDotOptions="{ type: 'dot', color: '#10b981' }"
            :backgroundOptions="{ color: '#ffffff' }"
            :imageOptions="{ hideBackgroundDots: true, imageSize: 0.4, margin: 0 }"
          />
        </div>

        <!-- Invite Code Display -->
        <div v-if="inviteCodeLoading" class="invite-code-section">
          <p class="loading-text">Generating setup code...</p>
        </div>

        <div v-else-if="inviteCodeError" class="invite-code-section error">
          <p class="error-text">{{ inviteCodeError }}</p>
          <button v-haptic @click="fetchInviteCode" class="btn-retry">
            Retry
          </button>
        </div>

        <div v-else-if="inviteCode" class="invite-code-section">
          <h3 class="invite-code-title">Setup Code for PWA</h3>
          <p class="invite-code-description">
            After installing the PWA, enter this code to complete setup:
          </p>
          <div class="code-display">
            <span class="code-text">{{ inviteCode.code }}</span>
            <button v-haptic @click="copyInviteCode" class="btn-copy">
              {{ codeCopied ? '✓ Copied' : 'Copy' }}
            </button>
          </div>
          <p class="expiration-text">
            Code expires {{ formatExpiration(inviteCode.expiresAt) }}
          </p>
        </div>

        <p class="qr-code-url">{{ installUrl }}</p>
      </div>

      <div class="settings-section">
        <h2 class="section-title">About</h2>
        <div class="about-info">
          <p class="about-text">ROSE Portal</p>
          <p class="about-subtext">Raspberry Pi 5 Smart Home Dashboard</p>
        </div>
      </div>
    </div>

    <!-- Configuration Edit Modals -->
    <ConfigurationEditModal
      v-model="showProjectKeyEdit"
      title="Edit Project Key"
      :current-value="currentProjectKey"
      placeholder="Enter project key"
      @save="handleProjectKeySave"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import ConfigurationEditModal from '@/components/common/ConfigurationEditModal.vue'
import NotificationPreferences from '@/components/notifications/NotificationPreferences.vue'
import Qrcode from 'qrcode-vue3'
import { useSettingsStore } from '@/stores/settingsStore'
import { useConfiguration } from '@/composables/useConfiguration'
import { usePWA } from '@/composables/usePWA'
import { usePushNotifications } from '@/composables/usePushNotifications'
import { useDeviceDetection } from '@/composables/useDeviceDetection'
import { useDarkMode } from '@/composables/useDarkMode'
import { usePwaStorage } from '@/composables/usePwaStorage'
import { projectService } from '@/services/projectService'
import { apiClients } from '@/services/apiClient'
import { useToast } from '@/composables/useToast'
import type { InviteCodeResponse } from '@/types/project'

const settingsStore = useSettingsStore()
const toast = useToast()

// Dark mode / Theme
const { currentTheme, setTheme } = useDarkMode()
const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'Auto' }
] as const

function handleToggle() {
  settingsStore.toggleHaptic()
}

// Screensaver Timeout Controls
function increaseTimeout() {
  const current = settingsStore.screensaverTimeout
  settingsStore.setScreensaverTimeout(Math.min(60, current + 1))
}

function decreaseTimeout() {
  const current = settingsStore.screensaverTimeout
  settingsStore.setScreensaverTimeout(Math.max(1, current - 1))
}

// Device Detection
const { isMobile, isTablet, isDesktop } = useDeviceDetection()

// Project Key Management
const { getProjectKey, setProjectKey } = useConfiguration()
const showProjectKeyEdit = ref(false)
const currentProjectKey = computed(() => getProjectKey() || '')

async function handleProjectKeySave(newKey: string) {
  try {
    const exists = await projectService.validateKey(newKey)
    if (exists) {
      setProjectKey(newKey)
      showProjectKeyEdit.value = false
      toast.success('Project key updated successfully')
    } else {
      toast.error('Invalid project key. Please check and try again.')
    }
  } catch (error) {
    toast.error('Failed to validate project key. Please try again.')
    console.error('Project key validation error:', error)
  }
}

// QR Code Install URL
const installUrl = computed(() => {
  const base = window.location.origin
  return `${base}/?action=install`
})

// Invite Code Management (for PWA setup)
const inviteCode = ref<InviteCodeResponse | null>(null)
const inviteCodeLoading = ref(false)
const inviteCodeError = ref<string | null>(null)
const codeCopied = ref(false)

async function fetchInviteCode() {
  inviteCodeLoading.value = true
  inviteCodeError.value = null

  try {
    inviteCode.value = await projectService.getInviteCode()
  } catch (err) {
    inviteCodeError.value = 'Failed to generate code'
    console.error('Failed to get invite code:', err)
  } finally {
    inviteCodeLoading.value = false
  }
}

async function copyInviteCode() {
  if (!inviteCode.value) return

  try {
    await navigator.clipboard.writeText(inviteCode.value.code)
    codeCopied.value = true
    setTimeout(() => {
      codeCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code:', err)
  }
}

function formatExpiration(expiresAt: string): string {
  const expiresDate = new Date(expiresAt)
  const now = new Date()
  const diffMs = expiresDate.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'soon'
  if (diffMins === 1) return 'in 1 minute'
  return `in ${diffMins} minutes`
}

onMounted(() => {
  if (isDesktop.value) {
    fetchInviteCode()
  }
})

// PWA & Notifications (only relevant for mobile/tablet)
const { isInstallable, isInstalled, install, offlineReady } = usePWA()
const {
  isSupported: isNotificationsSupported,
  permission,
  isGranted: isNotificationsGranted,
  isDenied: isNotificationsDenied,
  requestPermission,
  subscribe,
  unsubscribe,
  showNotification
} = usePushNotifications()

const notificationStatus = computed(() => {
  if (isNotificationsGranted.value) return 'Enabled'
  if (isNotificationsDenied.value) return 'Blocked by user'
  return 'Not enabled'
})

const notificationLoading = ref(false)

const handleInstall = async () => {
  await install()
}

const handleEnableNotifications = async () => {
  notificationLoading.value = true

  try {
    // Step 1: Request browser permission
    const granted = await requestPermission()

    if (!granted) {
      toast.warning('Notification permission denied. Please enable notifications in your browser settings.')
      notificationLoading.value = false
      return
    }

    // Step 2: Get VAPID public key from backend
    const { data } = await apiClients.notifications.get('/vapid-public-key')

    if (!data.publicKey) {
      console.warn('⚠️ VAPID public key not configured on server')
      toast.error('Push notifications are not configured on the server. Please contact support.')
      notificationLoading.value = false
      return
    }

    // Step 3: Subscribe to push notifications
    const subscription = await subscribe(data.publicKey)

    if (!subscription) {
      throw new Error('Failed to create push subscription')
    }

    // Step 4: Send subscription to backend
    await apiClients.notifications.post('/subscribe', subscription)

    console.log('✅ Subscribed to push notifications successfully')

    toast.success('Notifications enabled! You will now receive push notifications.')
  } catch (error) {
    console.error('❌ Failed to enable notifications:', error)

    // User-friendly error message
    let errorMessage = 'Failed to enable notifications. '
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage += 'Please log in and try again.'
      } else if (error.response.status === 500) {
        errorMessage += 'Server error. Please try again later.'
      } else {
        errorMessage += error.response.data?.message || 'Please try again.'
      }
    } else if (error.message) {
      errorMessage += error.message
    } else {
      errorMessage += 'Please try again.'
    }

    toast.error(errorMessage)
  } finally {
    notificationLoading.value = false
  }
}

const handleDisableNotifications = async () => {
  notificationLoading.value = true

  try {
    // Step 1: Get current subscription before unsubscribing
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      // Convert subscription to JSON format for backend
      const subscriptionJson = subscription.toJSON()

      // Step 2: Unsubscribe from backend (POST with subscription data)
      await apiClients.notifications.post('/unsubscribe', {
        endpoint: subscriptionJson.endpoint,
        keys: {
          p256dh: subscriptionJson.keys.p256dh,
          auth: subscriptionJson.keys.auth
        }
      })
    }

    // Step 3: Unsubscribe locally
    await unsubscribe()

    console.log('✅ Unsubscribed from push notifications')
    toast.success('Notifications disabled. You will no longer receive push notifications.')
  } catch (error) {
    console.error('❌ Failed to disable notifications:', error)

    // Even if backend call fails, try to unsubscribe locally
    try {
      await unsubscribe()
    } catch (localError) {
      console.error('Failed to unsubscribe locally:', localError)
    }

    toast.error('Failed to fully disable notifications. Please try again.')
  } finally {
    notificationLoading.value = false
  }
}

// PWA Data Export
const pwaStorage = usePwaStorage()
const pwaDataCopied = ref(false)

const handleExportPwaData = async () => {
  try {
    await pwaStorage.copyMigrationUrl()
    pwaDataCopied.value = true
    toast.success('Migration link copied to clipboard')
    setTimeout(() => {
      pwaDataCopied.value = false
    }, 5000)
  } catch (error) {
    console.error('Failed to export PWA data:', error)
    toast.error('Failed to copy link. Please try again.')
  }
}
</script>

<style scoped>
.settings {
  @apply max-w-2xl mx-auto space-y-8;
}

.settings-section {
  @apply bg-white rounded-xl shadow-md p-6;
}

.section-title {
  @apply text-xl font-bold text-gray-800 mb-4;
}

.setting-item {
  @apply flex items-center justify-between gap-6 py-4;
}

.setting-info {
  @apply flex-1;
}

.setting-label {
  @apply block text-lg font-semibold text-gray-800 mb-1 cursor-pointer;
}

.setting-description {
  @apply text-sm text-gray-600;
}

.setting-warning {
  @apply text-sm text-amber-600 mt-2;
}

.toggle-switch {
  @apply relative w-14 h-8 rounded-full transition-colors duration-200
         bg-gray-300 hover:bg-gray-400
         disabled:opacity-50 disabled:cursor-not-allowed
         flex-shrink-0;
}

.toggle-switch.active {
  @apply bg-green-500 hover:bg-green-600;
}

.toggle-slider {
  @apply absolute top-1 left-1 w-6 h-6 rounded-full bg-white
         shadow-md transition-transform duration-200;
}

.toggle-slider.active {
  @apply translate-x-6;
}

.about-info {
  @apply py-2;
}

.about-text {
  @apply text-lg font-semibold text-gray-800;
}

.about-subtext {
  @apply text-sm text-gray-600;
}

.btn-primary {
  @apply px-4 py-2 bg-green-500 text-white font-medium rounded-lg
         transition-all duration-150 active:scale-95
         hover:bg-green-600
         disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-500 text-white font-medium rounded-lg
         transition-all duration-150 active:scale-95
         hover:bg-gray-600;
}

.btn-test {
  @apply px-4 py-2 bg-blue-500 text-white font-medium rounded-lg
         transition-all duration-150 active:scale-95
         hover:bg-blue-600;
}

.status-indicator {
  @apply w-3 h-3 rounded-full flex-shrink-0;
}

.status-active {
  @apply bg-green-500 shadow-lg shadow-green-500/50;
}

.status-inactive {
  @apply bg-gray-300;
}

.qr-code-container {
  @apply flex justify-center items-center py-6 my-4 bg-white rounded-lg border-2 border-gray-200;
}

.qr-code-url {
  @apply text-xs text-gray-500 text-center mt-2 break-all px-4;
}

.timeout-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.timeout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
  min-width: var(--space-11);
  min-height: var(--space-11);
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border: var(--depth-1-border);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.timeout-btn:active:not(:disabled) {
  transform: scale(0.96);
  background: var(--color-bg-active);
}

.timeout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.timeout-btn svg {
  width: 16px;
  height: 16px;
}

.timeout-value {
  min-width: 60px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.theme-selector {
  display: flex;
  gap: var(--space-2);
}

.theme-btn {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border: var(--depth-1-border);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.theme-btn.active {
  color: var(--color-text-primary);
  background: var(--color-bg-active);
  border-color: var(--color-border-focus);
  font-weight: var(--font-weight-semibold);
}

.theme-btn:active:not(.active) {
  transform: scale(0.96);
}

.invite-code-section {
  margin-top: var(--space-4);
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.invite-code-title {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-2);
}

.invite-code-description {
  font-size: var(--font-size-13);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
}

.code-display {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-primary);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
}

.code-text {
  flex: 1;
  font-family: var(--font-mono);
  font-size: var(--font-size-20);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-primary);
  text-align: center;
  letter-spacing: 1px;
}

.btn-copy {
  padding: var(--space-2) var(--space-4);
  background: var(--color-accent-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy:hover {
  background: var(--color-accent-primary-hover);
}

.expiration-text {
  font-size: var(--font-size-12);
  color: var(--color-text-muted);
  text-align: center;
}

.loading-text {
  text-align: center;
  color: var(--color-text-secondary);
}

.error-text {
  color: var(--color-error-text);
  margin-bottom: var(--space-2);
}

.btn-retry {
  padding: var(--space-2) var(--space-4);
  background: var(--color-accent-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
</style>
