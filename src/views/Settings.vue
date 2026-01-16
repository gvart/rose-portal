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
              <q-icon name="warning" size="14px" /> Haptic feedback is not supported on this device
            </p>
          </div>

          <q-toggle
            :model-value="settingsStore.hapticEnabled"
            :disable="!settingsStore.hapticSupported"
            color="positive"
            size="md"
            @update:model-value="settingsStore.toggleHaptic"
          />
        </div>
      </div>

      <div class="settings-section">
        <h2 class="section-title">Screensaver</h2>

        <div class="setting-item">
          <div class="setting-info">
            <label for="screensaver-toggle" class="setting-label">Enable screensaver</label>
            <p class="setting-description">Show particle animation after period of inactivity</p>
          </div>

          <q-toggle
            :model-value="settingsStore.screensaverEnabled"
            color="positive"
            size="md"
            @update:model-value="settingsStore.toggleScreensaver"
          />
        </div>

        <div v-if="settingsStore.screensaverEnabled" class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Activate after</label>
            <p class="setting-description">Minutes of inactivity before screensaver appears</p>
          </div>

          <div class="timeout-controls">
            <button

              @click="decreaseTimeout"
              class="timeout-btn"
              :disabled="settingsStore.screensaverTimeout <= 1"
            >
              <q-icon name="remove" size="16px" />
            </button>

            <span class="timeout-value">{{ settingsStore.screensaverTimeout }} min</span>

            <button

              @click="increaseTimeout"
              class="timeout-btn"
              :disabled="settingsStore.screensaverTimeout >= 60"
            >
              <q-icon name="add" size="16px" />
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
              <q-icon name="warning" size="14px" /> Push notifications are not supported on this device/browser
            </p>
          </div>

          <button
            v-if="!isNotificationsGranted && isNotificationsSupported"
           
            @click="handleEnableNotifications"
            class="btn-primary"
            :disabled="isNotificationsDenied || notificationLoading"
          >
            {{ notificationLoading ? 'Enabling...' : 'Enable' }}
          </button>
          <button
            v-else-if="isNotificationsGranted"
           
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
              <template v-if="pwaDataCopied">
                <q-icon name="check" size="14px" color="positive" /> Link copied! Open it after installing the PWA
              </template>
              <template v-else>
                Copy a link to transfer your settings when installing the PWA
              </template>
            </p>
          </div>

          <button
           
            @click="handleExportPwaData"
            class="btn-primary"
          >
            {{ pwaDataCopied ? 'Copied!' : 'Copy Link' }}
          </button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">App Updates</label>
            <p class="setting-description">
              <q-icon v-if="showUpdateWarning" name="warning" size="14px" color="warning" />
              {{ updateStatusText }}
            </p>
          </div>

          <button
           
            @click="handleCheckForUpdates"
            class="btn-primary"
            :disabled="isCheckingForUpdates"
          >
            {{ isCheckingForUpdates ? 'Checking...' : 'Check for Updates' }}
          </button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Current Version</label>
            <p v-if="currentVersionInfo" class="setting-description">
              v{{ currentVersionInfo.version }} ({{ currentVersionInfo.commitHash }})
              <br>
              <span class="version-message">{{ currentVersionInfo.commitMessage.split('\n')[0] }}</span>
            </p>
            <p v-else class="setting-description">Loading version info...</p>
          </div>
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
           
            @click="showProjectKeyEdit = true"
            class="btn-primary"
          >
            Edit
          </button>
        </div>
      </div>

      <div v-if="isDesktop" class="settings-section full-width">
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
            :size="160"
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
          <button @click="fetchInviteCode" class="btn-retry">
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
            <button @click="copyInviteCode" class="btn-copy">
              <q-icon v-if="codeCopied" name="check" size="14px" />
              {{ codeCopied ? 'Copied' : 'Copy' }}
            </button>
          </div>
          <p class="expiration-text">
            Code expires {{ formatExpiration(inviteCode.expiresAt) }}
          </p>
        </div>

        <p class="qr-code-url">{{ installUrl }}</p>
      </div>

      <div class="settings-section full-width">
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
  fetchCurrentVersion()
})

// PWA & Notifications (only relevant for mobile/tablet)
const {
  isInstallable,
  isInstalled,
  install,
  offlineReady,
  checkForUpdates,
  isCheckingForUpdates,
  lastUpdateCheck,
  needRefresh
} = usePWA()
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

const updateStatusText = computed(() => {
  if (needRefresh.value) {
    return 'Update available - see banner above'
  }
  if (isCheckingForUpdates.value) {
    return 'Checking for updates...'
  }
  if (lastUpdateCheck.value) {
    const time = new Date(lastUpdateCheck.value).toLocaleTimeString()
    return `Last checked: ${time}`
  }
  return 'Auto-checks every hour'
})

const showUpdateWarning = computed(() => needRefresh.value)

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

const handleCheckForUpdates = async () => {
  await checkForUpdates()

  // Give the check a moment to complete and potentially trigger needRefresh
  setTimeout(() => {
    if (!needRefresh.value) {
      toast.success('You are running the latest version!')
    }
  }, 1000)
}

// Current version info
interface VersionInfo {
  version: string
  commitHash: string
  commitMessage: string
  commitDate: string
  buildDate: string
}

const currentVersionInfo = ref<VersionInfo | null>(null)

async function fetchCurrentVersion() {
  try {
    const response = await fetch('/version.json?' + Date.now())
    if (response.ok) {
      currentVersionInfo.value = await response.json()
    }
  } catch (error) {
    console.warn('Failed to fetch version info:', error)
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
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4);
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .settings {
    grid-template-columns: repeat(2, 1fr);
  }

  .settings-section.full-width {
    grid-column: 1 / -1;
  }
}

.settings-section {
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.section-title {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  padding-bottom: var(--space-2);
  border-bottom: var(--depth-1-border);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) 0;
}

.setting-item:not(:last-child) {
  border-bottom: 1px solid var(--color-border-subtle);
}

.setting-info {
  flex: 1;
  min-width: 0;
}

.setting-label {
  display: block;
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.setting-description {
  font-size: var(--font-size-12);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.version-message {
  font-style: italic;
  color: var(--color-text-muted);
}

.setting-warning {
  font-size: var(--font-size-12);
  color: var(--color-warning-text);
  margin-top: var(--space-1);
}


.about-info {
  padding: var(--space-2) 0;
}

.about-text {
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.about-subtext {
  font-size: var(--font-size-12);
  color: var(--color-text-secondary);
}

.btn-primary {
  padding: var(--space-2) var(--space-4);
  background: var(--color-success-bg);
  color: var(--color-success-text);
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  white-space: nowrap;
}

.btn-primary:hover {
  background: var(--color-success-bg-hover);
}

.btn-primary:active {
  transform: scale(0.96);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  border: var(--depth-1-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.btn-secondary:hover {
  background: var(--color-bg-secondary);
}

.btn-secondary:active {
  transform: scale(0.96);
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.status-active {
  background: var(--color-success-bg);
  box-shadow: 0 0 8px var(--color-success-bg);
}

.status-inactive {
  background: var(--color-bg-tertiary);
}

.qr-code-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-4);
  background: white;
  border: var(--depth-1-border);
  border-radius: var(--radius-md);
}

.qr-code-url {
  font-size: var(--font-size-11);
  color: var(--color-text-muted);
  text-align: center;
  margin-top: var(--space-2);
  word-break: break-all;
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

/* Mobile-specific optimizations for phones */
@media (max-width: 768px) {
  .settings {
    padding: var(--mobile-space-3) !important;
    gap: var(--section-gap-mobile) !important;
  }

  .settings-section {
    padding: var(--card-padding-mobile) !important;
    gap: var(--section-gap-mobile) !important;
  }

  .setting-item {
    padding: var(--mobile-space-2) 0 !important;
  }

  .setting-description {
    font-size: 12px !important;
    line-height: 1.3;
  }

  .section-title {
    font-size: 14px !important;
    padding-bottom: var(--mobile-space-2) !important;
  }

  .qr-code-container {
    padding: var(--mobile-space-3) !important;
  }

  .invite-code-section {
    padding: var(--mobile-space-3) !important;
    margin-top: var(--mobile-space-3) !important;
  }
}
</style>
