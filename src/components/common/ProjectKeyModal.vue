<template>
  <q-dialog v-model="shouldShow" persistent>
    <q-card class="project-key-card">
      <q-card-section>
        <div class="text-h5 q-mb-xs">Enter Project Key</div>
        <div class="text-caption text-grey-7">
          Enter your ROSE project key to get started
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="projectKey"
          label="Project Key"
          placeholder="Enter your project key"
          outlined
          :error="!!error"
          :error-message="error"
          @keydown.enter="handleValidate"
          autofocus
        />
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          unelevated
          color="primary"
          :label="isValidating ? 'Validating...' : 'Continue'"
          :disabled="!projectKey.trim() || isValidating"
          :loading="isValidating"
          @click="handleValidate"
          class="full-width"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useConfiguration } from '@/composables/useConfiguration'
import { projectService } from '@/services/projectService'

const route = useRoute()
const { getProjectKey, setProjectKey } = useConfiguration()

const shouldShow = ref(false)
const projectKey = ref('')
const error = ref('')
const isValidating = ref(false)

// Check if running as PWA
const isPWA = computed(() => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://')
})

// Check if currently in install flow
const isInstallFlow = computed(() => {
  return route.path === '/install' || route.query.action === 'install'
})

onMounted(async () => {
  // Don't show on install page or when navigating to install
  if (route.path === '/install' || route.query.action === 'install') {
    return
  }

  // Only show on web/desktop (not PWA) when no projectKey exists
  const hasProjectKey = !!getProjectKey()

  if (!isPWA.value && !hasProjectKey) {
    shouldShow.value = true
  }
})

async function handleValidate() {
  if (!projectKey.value.trim()) return

  error.value = ''
  isValidating.value = true

  try {
    console.log('[ProjectKeyModal] Validating project key:', projectKey.value.trim())
    const exists = await projectService.validateKey(projectKey.value.trim())
    console.log('[ProjectKeyModal] Validation result:', exists)

    if (exists) {
      console.log('[ProjectKeyModal] Setting project key')
      setProjectKey(projectKey.value.trim())
      console.log('[ProjectKeyModal] Project key set, closing modal')
      shouldShow.value = false
    } else {
      error.value = 'Invalid project key. Please check and try again.'
    }
  } catch (err) {
    error.value = 'Failed to validate project key. Please try again.'
    console.error('Project key validation error:', err)
  } finally {
    isValidating.value = false
  }
}
</script>

<style scoped>
.project-key-card {
  max-width: 448px;
  width: 100%;
}
</style>
