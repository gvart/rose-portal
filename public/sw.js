/* eslint-disable no-undef */
// Custom Service Worker for ROSE PWA
// Handles push notifications and notification clicks with deep linking

// Skip waiting and claim clients immediately
self.skipWaiting()
self.clients.claim()

// ========================================
// WORKBOX SETUP (Production Only)
// ========================================

// In production, Workbox libraries are bundled by vite-plugin-pwa
// In development, we skip Workbox entirely and just handle push notifications
const isProduction = typeof self.__WB_MANIFEST !== 'undefined'

if (isProduction) {
  // Import Workbox modules (only available in production build)
  import('workbox-precaching').then(({ precacheAndRoute, cleanupOutdatedCaches }) => {
    precacheAndRoute(self.__WB_MANIFEST)
    cleanupOutdatedCaches()
  })

  import('workbox-routing').then(({ registerRoute }) => {
    import('workbox-strategies').then(({ NetworkFirst, CacheFirst }) => {
      import('workbox-expiration').then(({ ExpirationPlugin }) => {
        import('workbox-cacheable-response').then(({ CacheableResponsePlugin }) => {
          // API calls - Network First with 10s timeout
          registerRoute(
            ({ url }) => url.pathname.startsWith('/api/'),
            new NetworkFirst({
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              plugins: [
                new ExpirationPlugin({
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                }),
                new CacheableResponsePlugin({
                  statuses: [0, 200]
                })
              ]
            })
          )

          // Actuator endpoints - Network First with 5s timeout
          registerRoute(
            ({ url }) => url.pathname.startsWith('/actuator/'),
            new NetworkFirst({
              cacheName: 'actuator-cache',
              networkTimeoutSeconds: 5,
              plugins: [
                new ExpirationPlugin({
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 5 // 5 minutes
                })
              ]
            })
          )

          // Images, fonts - Cache First
          registerRoute(
            ({ request }) =>
              request.destination === 'image' ||
              request.destination === 'font' ||
              /\.(png|jpg|jpeg|svg|gif|webp|woff2)$/.test(request.url),
            new CacheFirst({
              cacheName: 'assets-cache',
              plugins: [
                new ExpirationPlugin({
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                })
              ]
            })
          )
        })
      })
    })
  })
}

// ========================================
// PUSH NOTIFICATION HANDLING
// ========================================

/**
 * Handle push events from backend
 * The backend sends notifications with structured payloads
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event)

  if (!event.data) {
    console.warn('[SW] Push event has no data')
    return
  }

  try {
    // Parse notification payload from backend
    const payload = event.data.json()
    console.log('[SW] Push payload:', payload)

    const {
      title,
      body,
      icon = '/icons/pwa/icon-192x192.png',
      badge = '/icons/pwa/icon-72x72.png',
      tag,
      requireInteraction = false,
      actions = [],
      data = {}
    } = payload

    // Show notification using service worker
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon,
        badge,
        tag,
        requireInteraction,
        actions,
        data,
        vibrate: [200, 100, 200], // Vibration pattern
        timestamp: Date.now()
      })
    )
  } catch (error) {
    console.error('[SW] Error handling push event:', error)
  }
})

/**
 * Handle notification click events
 * Navigates user to appropriate app section based on notification type
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event)

  // Close the notification
  event.notification.close()

  const notificationData = event.notification.data || {}
  const action = event.action // Action button clicked (if any)

  console.log('[SW] Notification data:', notificationData)
  console.log('[SW] Action clicked:', action)

  // If user clicked "dismiss" action, just close
  if (action === 'dismiss') {
    return
  }

  // Determine target URL based on notification type
  let targetUrl = determineTargetUrl(notificationData, action)

  console.log('[SW] Target URL:', targetUrl)

  // Navigate to the target URL
  event.waitUntil(
    navigateToUrl(targetUrl)
  )
})

/**
 * Determine the target URL based on notification type and data
 * @param {Object} data - Notification data payload
 * @param {string} action - Action button clicked
 * @returns {string} - Target URL
 */
function determineTargetUrl(data, action) {
  const { type, eventId, choreId, actionUrl } = data

  // Use actionUrl if provided and action is 'view' or no action
  if ((action === 'view' || !action) && actionUrl) {
    return actionUrl
  }

  // Build URL based on notification type
  switch (type) {
    case 'CALENDAR_CREATED':
    case 'CALENDAR_UPDATED':
    case 'CALENDAR_DELETED':
      if (eventId) {
        return `/calendar?eventId=${eventId}`
      }
      return '/calendar'

    case 'CALENDAR_REMINDER':
      if (eventId) {
        // For reminders, navigate to day view
        return `/calendar?eventId=${eventId}&view=day`
      }
      return '/calendar'

    case 'CHORE_ASSIGNED':
    case 'CHORE_STATUS_CHANGED':
      if (choreId) {
        return `/chores?choreId=${choreId}`
      }
      return '/chores'

    default:
      // Default to home page
      return '/'
  }
}

/**
 * Navigate to a URL, focusing existing window if available
 * @param {string} targetUrl - URL to navigate to
 * @returns {Promise} - Promise that resolves when navigation complete
 */
async function navigateToUrl(targetUrl) {
  try {
    // Get all windows controlled by this service worker
    const clientList = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })

    console.log('[SW] Found clients:', clientList.length)

    // Check if there's an existing window to focus
    for (const client of clientList) {
      // Check if client is on the same origin
      const clientUrl = new URL(client.url)
      const targetUrlObj = new URL(targetUrl, self.location.origin)

      if (clientUrl.origin === targetUrlObj.origin) {
        console.log('[SW] Focusing existing client and navigating')

        // Focus the window
        await client.focus()

        // Navigate to the target URL
        if ('navigate' in client) {
          return client.navigate(targetUrl)
        } else {
          // Fallback: post message to client to navigate
          client.postMessage({
            type: 'NAVIGATE',
            url: targetUrl
          })
          return client
        }
      }
    }

    // No existing window found, open a new one
    console.log('[SW] Opening new window')
    if (self.clients.openWindow) {
      return self.clients.openWindow(targetUrl)
    }
  } catch (error) {
    console.error('[SW] Error navigating to URL:', error)
  }
}

/**
 * Handle messages from the app
 * This allows the app to communicate with the service worker
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

console.log('[SW] Service Worker initialized with push notification support')
