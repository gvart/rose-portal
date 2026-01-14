<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Setup Required
        </h2>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          Configure your backend connection to use ROSE
        </p>
      </div>

      <!-- Setup Options -->
      <div class="space-y-3">
        <!-- iOS QR Scan Option -->
        <div v-if="isIOS" class="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
            Quick Setup (Recommended)
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            If you installed via QR code, scan it again to automatically transfer settings
          </p>
        </div>

        <!-- Manual Setup Button -->
        <button
          @click="handleManualSetup"
          class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Configure in Settings
        </button>
      </div>

      <!-- Info -->
      <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p class="text-xs text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> PWA apps have separate storage from your browser. Configuration must be set up once for the installed app.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePwaStorage } from '@/composables/usePwaStorage'
import { useRouter } from 'vue-router'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const pwaStorage = usePwaStorage()
const router = useRouter()

const isIOS = computed(() => /iPad|iPhone|iPod/.test(navigator.userAgent))

function handleManualSetup() {
  pwaStorage.completeMigration()
  emit('close')
  router.push('/settings')
}
</script>
