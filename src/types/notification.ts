/**
 * Notification Types and Interfaces
 *
 * These types define the structure of push notification payloads
 * sent from the backend and handled by the service worker.
 */

// Notification type enum
export enum NotificationType {
  CALENDAR_CREATED = 'CALENDAR_CREATED',
  CALENDAR_UPDATED = 'CALENDAR_UPDATED',
  CALENDAR_DELETED = 'CALENDAR_DELETED',
  CALENDAR_REMINDER = 'CALENDAR_REMINDER',
  CHORE_ASSIGNED = 'CHORE_ASSIGNED',
  CHORE_STATUS_CHANGED = 'CHORE_STATUS_CHANGED'
}

// Notification action
export interface NotificationAction {
  action: string
  title: string
}

// Base notification data interface
export interface NotificationData {
  type: NotificationType
  actionUrl: string
}

// Calendar notification data
export interface CalendarNotificationData extends NotificationData {
  eventId: number
}

// Chore notification data
export interface ChoreNotificationData extends NotificationData {
  choreId: number
  priority?: 'low' | 'medium' | 'high'
}

// Full notification payload from backend
export interface NotificationPayload {
  type: NotificationType
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  actions?: NotificationAction[]
  data: CalendarNotificationData | ChoreNotificationData
}

// Notification preference
export interface NotificationPreference {
  type: string
  label: string
  description: string
  enabled: boolean
}

// Push subscription data sent to backend
export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  userAgent?: string
}

// VAPID public key response
export interface VapidPublicKeyResponse {
  publicKey: string
}
