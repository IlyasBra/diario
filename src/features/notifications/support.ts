/**
 * What the app can do with notifications on this device:
 * - "install-required": iPhone/iPad in a browser tab. iOS only allows web
 *   notifications for apps added to the Home Screen.
 * - "unsupported": the browser has no Notification API at all.
 * - otherwise the permission state: "default" (not asked yet), "granted"
 *   or "denied".
 */
export type NotificationSupport = 'install-required' | 'unsupported' | NotificationPermission

export function isAppleMobile(): boolean {
  const { userAgent, maxTouchPoints } = navigator
  // iPadOS reports itself as a Mac, but Macs have no touch screen.
  return (
    /iPad|iPhone|iPod/.test(userAgent) || (userAgent.includes('Macintosh') && maxTouchPoints > 1)
  )
}

export function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches
}

export function getNotificationSupport(): NotificationSupport {
  if (!('Notification' in window)) {
    return isAppleMobile() && !isStandalone() ? 'install-required' : 'unsupported'
  }
  return Notification.permission
}
