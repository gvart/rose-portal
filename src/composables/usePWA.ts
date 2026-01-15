import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

export interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const isInstallable = ref(false)
  const isInstalled = ref(false)
  const deferredPrompt = ref<PWAInstallPrompt | null>(null)
  const isCheckingForUpdates = ref(false)
  const lastUpdateCheck = ref<Date | null>(null)

  // Check if already installed (do this immediately, not in onMounted)
  const checkInstalled = () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled.value = true
      console.log('[PWA] App is running as installed PWA')
    } else {
      console.log('[PWA] App is running in browser mode')
    }
  }

  // Check installation status immediately
  checkInstalled()

  // Service Worker registration
  const {
    needRefresh,
    offlineReady,
    updateServiceWorker
  } = useRegisterSW({
    immediate: true,
    onRegistered(registration) {
      console.log('[PWA] Service Worker registered:', registration)

      // Set up periodic update checks (every hour)
      if (registration) {
        setInterval(() => {
          console.log('[PWA] Performing periodic update check')
          checkForUpdates(registration)
        }, 60 * 60 * 1000) // 1 hour
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Service Worker registration error:', error)
    },
    onOfflineReady() {
      console.log('[PWA] App ready to work offline')
    }
  })

  // Manual update check
  const checkForUpdates = async (registration?: ServiceWorkerRegistration) => {
    if (isCheckingForUpdates.value) {
      console.log('[PWA] Update check already in progress')
      return
    }

    isCheckingForUpdates.value = true
    lastUpdateCheck.value = new Date()

    try {
      if (!registration && 'serviceWorker' in navigator) {
        registration = await navigator.serviceWorker.ready
      }

      if (registration) {
        console.log('[PWA] Checking for updates...')
        await registration.update()
        console.log('[PWA] Update check completed')
      }
    } catch (error) {
      console.error('[PWA] Update check failed:', error)
    } finally {
      isCheckingForUpdates.value = false
    }
  }

  // Handle install prompt
  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault()
    deferredPrompt.value = e as any
    isInstallable.value = true
    console.log('[PWA] Install prompt available')
  }

  // Trigger install prompt
  const install = async (): Promise<boolean> => {
    if (!deferredPrompt.value) {
      console.warn('[PWA] No install prompt available')
      return false
    }

    await deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice

    console.log(`[PWA] User ${outcome} the install prompt`)

    if (outcome === 'accepted') {
      isInstalled.value = true
      isInstallable.value = false
    }

    deferredPrompt.value = null
    return outcome === 'accepted'
  }

  // Handle app installed event
  const handleAppInstalled = () => {
    console.log('[PWA] App installed')
    isInstalled.value = true
    isInstallable.value = false
    deferredPrompt.value = null
  }

  // Handle visibility change - check for updates when app comes to foreground
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log('[PWA] App returned to foreground, checking for updates')
      checkForUpdates()
    }
  }

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    // Install state
    isInstallable,
    isInstalled,
    install,

    // Service Worker state
    needRefresh,
    offlineReady,
    updateServiceWorker,

    // Update checking
    checkForUpdates,
    isCheckingForUpdates,
    lastUpdateCheck
  }
}
