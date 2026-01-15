<template>
  <div>
    <!-- Initial Sign In/Sign Up Modal (shown if no users exist) -->
    <AuthModal
      v-model:show="showInitialAuth"
      :mode="initialAuthMode"
      @success="handleAuthSuccess"
    />

    <!-- User Selection Modal (shown for initial auth or after screensaver dismissal) -->
    <UserSelectionModal
      v-model:show="showUserSelection"
      @select-user="handleUserSelected"
      @new-user="handleNewUserFromSelection"
      @sign-in="handleSignInFromSelection"
      @remove-user="handleRemoveUser"
    />

    <!-- Quick Login / Sign In Modal -->
    <AuthModal
      v-model:show="showAuthFlow"
      :mode="authFlowMode"
      :prefilled-username="authFlowUsername"
      :user-id="authFlowUserId"
      :show-back-to-selection="cameFromUserSelection"
      @success="handleAuthSuccess"
      @back-to-selection="handleBackToSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useMultiUserAuth } from '@/composables/useMultiUserAuth'
import { useConfiguration } from '@/composables/useConfiguration'
import { useAuthFlow } from '@/composables/useAuthFlow'
import { usePWA } from '@/composables/usePWA'
import AuthModal from './AuthModal.vue'
import UserSelectionModal from './UserSelectionModal.vue'
import type { StoredUser } from '@/types/auth'

const route = useRoute()
const authStore = useAuthStore()
const multiUser = useMultiUserAuth()
const { isConfigured, projectKey, getProjectKey } = useConfiguration()
const { shouldShowUserSelection, clearUserSelection } = useAuthFlow()
const { isInstalled } = usePWA()

// Initial auth (for first-time users)
const showInitialAuth = ref(false)
const initialAuthMode = ref<'signin' | 'signup'>('signup')

// User selection (after screensaver)
const showUserSelection = ref(false)

// Auth flow (for sign in / quick login)
const showAuthFlow = ref(false)
const authFlowMode = ref<'signin' | 'signup' | 'quick-login'>('signin')
const authFlowUsername = ref('')
const authFlowUserId = ref('')
const cameFromUserSelection = ref(false)

const hasUsers = computed(() => multiUser.hasUsers.value)
const hasProjectKey = computed(() => !!projectKey.value)
const isInstallPage = computed(() => route.path === '/install')

// Watch for trigger from screensaver dismissal
watch(shouldShowUserSelection, (should) => {
  if (should && (authStore.isAuthenticated || hasUsers.value)) {
    showUserSelection.value = true
    clearUserSelection()
  }
})

// Helper function to check if auth selection should show
function shouldShowAuthSelection(): boolean {
  const result = (
    isConfigured.value &&
    hasProjectKey.value &&
    !isInstallPage.value &&
    !authStore.isAuthenticated
  )

  console.log('[AuthOrchestrator] shouldShowAuthSelection check:', {
    isConfigured: isConfigured.value,
    hasProjectKey: hasProjectKey.value,
    projectKeyValue: projectKey.value,
    isInstallPage: isInstallPage.value,
    isAuthenticated: authStore.isAuthenticated,
    result
  })

  return result
}

// Watch for configuration changes to show user selection
watch(isConfigured, (configured) => {
  if (configured && shouldShowAuthSelection() && !showUserSelection.value && !showAuthFlow.value) {
    // Check for single-user auto-login in PWA mode
    if (isInstalled.value) {
      const users = multiUser.users.value
      if (users.length === 1) {
        console.log('[AuthOrchestrator] PWA with single user detected - auto-login')
        const singleUser = users[0]
        authFlowMode.value = 'quick-login'
        authFlowUsername.value = singleUser.username
        authFlowUserId.value = singleUser.id
        cameFromUserSelection.value = false
        showAuthFlow.value = true
        return
      }
    }

    showUserSelection.value = true
  }
})

// Watch for project key changes to show appropriate auth modal
watch(projectKey, (key) => {
  console.log('[AuthOrchestrator] Project key changed:', key)
  if (key && shouldShowAuthSelection()) {
    console.log('[AuthOrchestrator] Should show auth selection. Has users:', hasUsers.value)

    if (!showUserSelection.value && !showAuthFlow.value && !showInitialAuth.value) {
      // Check for single-user auto-login in PWA mode
      if (isInstalled.value) {
        const users = multiUser.users.value
        if (users.length === 1) {
          console.log('[AuthOrchestrator] PWA with single user detected - auto-login')
          const singleUser = users[0]
          authFlowMode.value = 'quick-login'
          authFlowUsername.value = singleUser.username
          authFlowUserId.value = singleUser.id
          cameFromUserSelection.value = false
          showAuthFlow.value = true
          return
        }
      }

      console.log('[AuthOrchestrator] Showing user selection modal')
      showUserSelection.value = true
    }
  }
}, { immediate: true })

// Watch for route changes to recheck auth selection need
watch(() => route.path, () => {
  if (shouldShowAuthSelection() && !showUserSelection.value && !showAuthFlow.value && !showInitialAuth.value) {
    // Check for single-user auto-login in PWA mode
    if (isInstalled.value) {
      const users = multiUser.users.value
      if (users.length === 1) {
        console.log('[AuthOrchestrator] PWA with single user detected - auto-login')
        const singleUser = users[0]
        authFlowMode.value = 'quick-login'
        authFlowUsername.value = singleUser.username
        authFlowUserId.value = singleUser.id
        cameFromUserSelection.value = false
        showAuthFlow.value = true
        return
      }
    }

    // Always show user selection modal (it has both "Sign In" and "New User" options)
    showUserSelection.value = true
  }
})

onMounted(() => {
  console.log('[AuthOrchestrator] onMounted - checking auth state', {
    isInstalled: isInstalled.value,
    shouldShowAuthSelection: shouldShowAuthSelection(),
    usersCount: multiUser.users.value.length,
    isAuthenticated: authStore.isAuthenticated
  })

  // Check for single-user auto-login in PWA mode
  if (isInstalled.value && shouldShowAuthSelection()) {
    const users = multiUser.users.value

    // If exactly one user exists, auto-login in PWA
    if (users.length === 1) {
      console.log('[AuthOrchestrator] PWA with single user detected - triggering auto-login')
      const singleUser = users[0]
      authFlowMode.value = 'quick-login'
      authFlowUsername.value = singleUser.username
      authFlowUserId.value = singleUser.id
      cameFromUserSelection.value = false
      showAuthFlow.value = true
      return
    }
  }

  // Show appropriate auth modal if conditions are met
  if (shouldShowAuthSelection()) {
    console.log('[AuthOrchestrator] Showing user selection modal')
    showUserSelection.value = true
  }
})

function handleUserSelected(user: StoredUser): void {
  showUserSelection.value = false
  authFlowMode.value = 'quick-login'
  authFlowUsername.value = user.username
  authFlowUserId.value = user.id
  cameFromUserSelection.value = false // Quick login doesn't allow back navigation
  showAuthFlow.value = true
}

function handleNewUserFromSelection(): void {
  showUserSelection.value = false
  authFlowMode.value = 'signup'
  authFlowUsername.value = ''
  authFlowUserId.value = ''
  cameFromUserSelection.value = true
  showAuthFlow.value = true
}

function handleSignInFromSelection(): void {
  showUserSelection.value = false
  authFlowMode.value = 'signin'
  authFlowUsername.value = ''
  authFlowUserId.value = ''
  cameFromUserSelection.value = true
  showAuthFlow.value = true
}

function handleBackToSelection(): void {
  showAuthFlow.value = false
  cameFromUserSelection.value = false
  showUserSelection.value = true
}

function handleRemoveUser(user: StoredUser): void {
  // User was removed, no action needed here
  // UserSelection component handles the removal
  console.log(`User ${user.username} removed`)
}

function handleAuthSuccess(): void {
  showInitialAuth.value = false
  showAuthFlow.value = false
  showUserSelection.value = false
}
</script>
