import { type Alert } from './alerts'

/**
 * Shows a system notification. Prefers the service worker (required by
 * iOS Home Screen apps and Android Chrome, available after the PWA phase)
 * and falls back to the Notification constructor on desktop browsers.
 * Resolves to false when the system refused, so the caller can show the
 * alert inside the app instead.
 */
export async function showSystemNotification(alert: Alert): Promise<boolean> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false

  const options: NotificationOptions = { body: alert.body, tag: alert.key }

  try {
    const registration =
      'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined
    if (registration) {
      await registration.showNotification(alert.title, options)
    } else {
      new Notification(alert.title, options)
    }
    return true
  } catch (error) {
    console.warn('Could not show notification', error)
    return false
  }
}
