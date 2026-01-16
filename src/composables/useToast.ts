/**
 * Toast Notification Composable
 *
 * Wrapper around Quasar Notify for consistent toast notifications
 */

import { Notify } from 'quasar'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
}

// Keep toasts ref for backward compatibility
const toasts = ref<Toast[]>([])

export function useToast() {
  const show = (message: string, type: ToastType = 'info', duration: number = 3000) => {
    // Map toast types to Quasar types
    const typeMap: Record<ToastType, string> = {
      success: 'positive',
      error: 'negative',
      info: 'info',
      warning: 'warning'
    }

    Notify.create({
      message,
      type: typeMap[type],
      position: 'top-right',
      timeout: duration,
      actions: [
        { icon: 'close', color: 'white', flat: true }
      ]
    })

    return Date.now() // Return a pseudo-id for compatibility
  }

  const dismiss = (id: number) => {
    // Quasar handles dismissal automatically
    // This is kept for API compatibility
  }

  const success = (message: string, duration?: number) => show(message, 'success', duration)
  const error = (message: string, duration?: number) => show(message, 'error', duration)
  const info = (message: string, duration?: number) => show(message, 'info', duration)
  const warning = (message: string, duration?: number) => show(message, 'warning', duration)

  return {
    toasts, // Keep for backward compatibility
    show,
    dismiss,
    success,
    error,
    info,
    warning
  }
}
