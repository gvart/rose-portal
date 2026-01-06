import { ref, computed } from 'vue'

export type NotificationPermission = 'default' | 'granted' | 'denied'

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export function usePushNotifications() {
  const permission = ref<NotificationPermission>('default')
  const isSupported = ref(false)
  const subscription = ref<PushSubscriptionData | null>(null)

  // Check browser support
  const checkSupport = () => {
    isSupported.value =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    if (isSupported.value && Notification.permission) {
      permission.value = Notification.permission as NotificationPermission
    }
  }

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) {
      console.warn('[Notifications] Not supported')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result as NotificationPermission
      console.log('[Notifications] Permission:', result)
      return result === 'granted'
    } catch (error) {
      console.error('[Notifications] Permission error:', error)
      return false
    }
  }

  // Subscribe to push notifications
  const subscribe = async (vapidPublicKey: string): Promise<PushSubscriptionData | null> => {
    if (permission.value !== 'granted') {
      console.warn('[Notifications] Permission not granted')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.ready

      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      const p256dh = arrayBufferToBase64(pushSubscription.getKey('p256dh')!)
      const auth = arrayBufferToBase64(pushSubscription.getKey('auth')!)

      subscription.value = {
        endpoint: pushSubscription.endpoint,
        keys: { p256dh, auth }
      }

      console.log('[Notifications] Subscribed:', subscription.value)
      return subscription.value
    } catch (error) {
      console.error('[Notifications] Subscribe error:', error)
      return null
    }
  }

  // Unsubscribe from push notifications
  const unsubscribe = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready
      const pushSubscription = await registration.pushManager.getSubscription()

      if (pushSubscription) {
        await pushSubscription.unsubscribe()
        subscription.value = null
        console.log('[Notifications] Unsubscribed')
        return true
      }

      return false
    } catch (error) {
      console.error('[Notifications] Unsubscribe error:', error)
      return false
    }
  }

  // Show local notification (for testing)
  const showNotification = async (
    title: string,
    options?: NotificationOptions
  ): Promise<void> => {
    if (permission.value !== 'granted') {
      console.warn('[Notifications] Permission not granted')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        icon: '/icons/pwa/icon-192x192.png',
        badge: '/icons/pwa/icon-72x72.png',
        ...options
      })
    } catch (error) {
      console.error('[Notifications] Show error:', error)
    }
  }

  // Utility: Convert VAPID key
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }

  // Utility: Convert ArrayBuffer to Base64
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  // Initialize
  checkSupport()

  const isGranted = computed(() => permission.value === 'granted')
  const isDenied = computed(() => permission.value === 'denied')

  return {
    isSupported,
    permission,
    isGranted,
    isDenied,
    subscription,

    requestPermission,
    subscribe,
    unsubscribe,
    showNotification
  }
}
