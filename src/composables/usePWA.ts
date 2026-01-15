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
    },
    onRegisterError(error) {
      console.error('[PWA] Service Worker registration error:', error)
    },
    onOfflineReady() {
      console.log('[PWA] App ready to work offline')
    }
  })

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

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
  })

  return {
    // Install state
    isInstallable,
    isInstalled,
    install,

    // Service Worker state
    needRefresh,
    offlineReady,
    updateServiceWorker
  }
}
