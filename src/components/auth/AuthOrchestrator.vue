<template>
  <div>
    <!-- Initial Sign In/Sign Up Modal (shown if no users exist) -->
    <AuthModal
      v-model:show="showInitialAuth"
      :mode="initialAuthMode"
      :is-required="!hasUsers && isConfigured && !isInstallPage"
      @success="handleAuthSuccess"
    />

    <!-- User Selection Modal (shown after screensaver dismissal) -->
    <UserSelectionModal
      v-model:show="showUserSelection"
      @select-user="handleUserSelected"
      @new-user="handleNewUserFromSelection"
      @sign-in="handleSignInFromSelection"
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
import AuthModal from './AuthModal.vue'
import UserSelectionModal from './UserSelectionModal.vue'
import type { StoredUser } from '@/types/auth'

const route = useRoute()
const authStore = useAuthStore()
const multiUser = useMultiUserAuth()
const { isConfigured } = useConfiguration()
const { shouldShowUserSelection, clearUserSelection } = useAuthFlow()

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
const isInstallPage = computed(() => route.path === '/install')

// Watch for trigger from screensaver dismissal
watch(shouldShowUserSelection, (should) => {
  if (should && (authStore.isAuthenticated || hasUsers.value)) {
    showUserSelection.value = true
    clearUserSelection()
  }
})

onMounted(() => {
  // Show initial auth if:
  // 1. No users exist
  // 2. App is configured
  // 3. Not on install page
  // 4. Not already authenticated
  if (!hasUsers.value && isConfigured.value && !isInstallPage.value && !authStore.isAuthenticated) {
    showInitialAuth.value = true
    initialAuthMode.value = 'signup'
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

function handleAuthSuccess(): void {
  showInitialAuth.value = false
  showAuthFlow.value = false
  showUserSelection.value = false
}
</script>
