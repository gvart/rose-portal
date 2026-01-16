<template>
  <q-dialog v-model="shouldShow" persistent>
    <q-card class="project-join-card">
      <q-card-section>
        <div class="text-h5 q-mb-xs">Join Project</div>
        <div class="text-caption text-grey-7">
          Enter the invite code from your installation page
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          ref="inviteCodeInputRef"
          v-model="inviteCode"
          label="Invite Code"
          placeholder="Enter invite code"
          outlined
          inputmode="numeric"
          maxlength="20"
          :error="!!error"
          :error-message="error"
          @keydown.enter="handleJoin"
          autofocus
          input-class="text-center"
          input-style="font-family: var(--font-mono); font-size: var(--font-size-18); letter-spacing: 2px; text-transform: uppercase;"
        >
          <template v-slot:hint>
            Get this code from the installation page on your desktop/Pi5
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          unelevated
          color="primary"
          :label="isJoining ? 'Joining...' : 'Join Project'"
          :disabled="!inviteCode.trim() || isJoining"
          :loading="isJoining"
          @click="handleJoin"
          class="full-width"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useConfiguration } from '@/composables/useConfiguration'
import { projectService } from '@/services/projectService'

const { getProjectKey, setProjectKey } = useConfiguration()

const shouldShow = ref(false)
const inviteCode = ref('')
const error = ref('')
const isJoining = ref(false)
const inviteCodeInputRef = ref<HTMLInputElement | null>(null)

// Check if running as PWA
const isPWA = computed(() => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://')
})

onMounted(async () => {
  // Only show for PWA without project key
  const hasProjectKey = !!getProjectKey()

  if (isPWA.value && !hasProjectKey) {
    shouldShow.value = true
    await nextTick()
    inviteCodeInputRef.value?.focus()
  }
})

async function handleJoin() {
  if (!inviteCode.value.trim()) return

  error.value = ''
  isJoining.value = true

  try {
    console.log('[ProjectJoinModal] Attempting to join with code:', inviteCode.value.trim())
    const projectKey = await projectService.joinProject(inviteCode.value.trim())
    console.log('[ProjectJoinModal] Successfully joined, projectKey:', projectKey)
    setProjectKey(projectKey)
    shouldShow.value = false

    // Success! User can now proceed to auth
  } catch (err: any) {
    console.error('[ProjectJoinModal] Join failed:', err)
    console.error('[ProjectJoinModal] Error details:', {
      message: err.message,
      statusCode: err.statusCode,
      response: err.response,
      stack: err.stack
    })

    // Handle specific errors
    if (err.statusCode === 404 || err.statusCode === 400) {
      error.value = 'Invalid or expired invite code. Please check and try again.'
    } else if (err.statusCode === 429) {
      error.value = 'Too many attempts. Please wait a moment and try again.'
    } else {
      // Temporary: Show detailed error for debugging
      const errorMsg = err.message || err.toString()
      error.value = `Failed to join project: ${errorMsg}`
    }
  } finally {
    isJoining.value = false
  }
}
</script>

<style scoped>
.project-join-card {
  max-width: 448px;
  width: 100%;
}
</style>
