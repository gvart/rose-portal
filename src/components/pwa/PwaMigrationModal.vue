<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome to ROSE PWA
        </h2>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          Set up your backend connection to get started
        </p>
      </div>

      <!-- Migration Options -->
      <div class="space-y-4">
        <!-- Option 1: Import from Browser -->
        <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
          <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Setup
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            If you already configured ROSE in your browser, open this link from your browser to transfer settings:
          </p>
          <button
            @click="handleCopyUrl"
            class="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg v-if="!copied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ copied ? 'Copied!' : 'Copy Setup Link' }}
          </button>
          <p class="text-xs text-gray-500 dark:text-gray-500 text-center">
            Open this link in your browser, then return here
          </p>
        </div>

        <!-- Option 2: Manual Setup -->
        <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
          <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manual Setup
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Configure your backend connection manually in Settings
          </p>
          <button
            @click="handleManualSetup"
            class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to Settings
          </button>
        </div>
      </div>

      <!-- Info Box -->
      <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p class="text-xs text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> PWA apps run in a separate storage context. You'll need to configure your backend connection once for the installed app.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
const copied = ref(false)

async function handleCopyUrl() {
  try {
    await pwaStorage.copyMigrationUrl()
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy URL:', error)
    alert('Failed to copy link. Please try manual setup instead.')
  }
}

function handleManualSetup() {
  pwaStorage.completeMigration()
  emit('close')
  router.push('/settings')
}
</script>
