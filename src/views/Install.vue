<template>
  <AppLayout title="Install ROSE" theme-color="#10b981">
    <div class="install-page">
      <!-- Success Message -->
      <div v-if="configurationSaved" class="success-card">
        <div class="success-icon">✓</div>
        <h2 class="success-title">Configuration Saved!</h2>
        <p class="success-message">
          Your backend and Vosk URLs have been configured successfully.
        </p>
      </div>

      <!-- Error Message -->
      <div v-else-if="error" class="error-card">
        <div class="error-icon">⚠</div>
        <h2 class="error-title">Invalid Configuration</h2>
        <p class="error-message">{{ error }}</p>
      </div>

      <!-- PWA Install Instructions -->
      <div v-if="configurationSaved" class="instructions-card">
        <h3 class="instructions-title">Install ROSE App</h3>

        <!-- iOS Instructions -->
        <div v-if="isIOS" class="platform-instructions">
          <p class="platform-label">iOS Installation:</p>
          <ol class="instruction-list">
            <li>Tap the Share button (square with arrow) at the bottom of Safari</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" in the top right corner</li>
            <li>ROSE will appear on your home screen</li>
          </ol>
        </div>

        <!-- Android Instructions -->
        <div v-else-if="isAndroid" class="platform-instructions">
          <p class="platform-label">Android Installation:</p>
          <ol class="instruction-list">
            <li>Tap the menu button (three dots) in Chrome</li>
            <li>Tap "Add to Home screen"</li>
            <li>Confirm by tapping "Add"</li>
            <li>ROSE will appear on your home screen</li>
          </ol>

          <button
            v-if="isInstallable"
            v-haptic
            @click="handleInstall"
            class="btn-install-pwa"
          >
            Install Now
          </button>
        </div>

        <!-- Desktop -->
        <div v-else class="platform-instructions">
          <p class="platform-label">
            Visit this page on your mobile device to install ROSE as an app.
          </p>
        </div>
      </div>

      <!-- Go Home Button -->
      <div v-if="configurationSaved" class="action-section">
        <button
          v-haptic
          @click="goHome"
          class="btn-go-home"
        >
          Go to Home
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfiguration } from '@/composables/useConfiguration'
import { usePWA } from '@/composables/usePWA'
import AppLayout from '@/layouts/AppLayout.vue'

const route = useRoute()
const router = useRouter()
const { setBackendUrl, setVoskUrl, validateUrl } = useConfiguration()
const { isInstallable, install } = usePWA()

const configurationSaved = ref(false)
const error = ref<string | null>(null)

// Platform detection
const isIOS = computed(() => /iPad|iPhone|iPod/.test(navigator.userAgent))
const isAndroid = computed(() => /Android/.test(navigator.userAgent))

onMounted(() => {
  const backendUrl = route.query.backendUrl as string
  const voskUrl = route.query.voskUrl as string

  if (!backendUrl || !voskUrl) {
    error.value = 'Missing backend or Vosk URL parameters'
    return
  }

  if (!validateUrl(backendUrl)) {
    error.value = `Invalid backend URL: ${backendUrl}`
    return
  }

  if (!validateUrl(voskUrl)) {
    error.value = `Invalid Vosk URL: ${voskUrl}`
    return
  }

  try {
    setBackendUrl(backendUrl)
    setVoskUrl(voskUrl)
    configurationSaved.value = true
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error'
    error.value = `Failed to save configuration: ${errorMessage}`
  }
})

const handleInstall = async () => {
  await install()
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.install-page {
  @apply max-w-2xl mx-auto space-y-6 p-4;
}

/* Success Card */
.success-card {
  @apply bg-white rounded-xl shadow-md p-8 text-center;
}

.success-icon {
  @apply w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 text-green-600
         flex items-center justify-center text-4xl font-bold;
}

.success-title {
  @apply text-2xl font-bold text-gray-900 mb-2;
}

.success-message {
  @apply text-gray-600;
}

/* Error Card */
.error-card {
  @apply bg-white rounded-xl shadow-md p-8 text-center;
}

.error-icon {
  @apply w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 text-red-600
         flex items-center justify-center text-4xl font-bold;
}

.error-title {
  @apply text-2xl font-bold text-gray-900 mb-2;
}

.error-message {
  @apply text-red-600;
}

/* Instructions Card */
.instructions-card {
  @apply bg-white rounded-xl shadow-md p-6;
}

.instructions-title {
  @apply text-xl font-bold text-gray-900 mb-4;
}

.platform-instructions {
  @apply space-y-4;
}

.platform-label {
  @apply font-semibold text-gray-900 mb-2;
}

.instruction-list {
  @apply list-decimal list-inside space-y-2 text-gray-700 pl-2;
}

.btn-install-pwa {
  @apply w-full mt-6 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg
         transition-all duration-150 active:scale-95 hover:bg-green-600
         focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2;
}

/* Action Section */
.action-section {
  @apply pb-4;
}

.btn-go-home {
  @apply w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg
         transition-all duration-150 active:scale-95 hover:bg-blue-600
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}
</style>
