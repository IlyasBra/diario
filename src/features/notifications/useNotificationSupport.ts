import { useCallback, useEffect, useState } from 'react'

import { getNotificationSupport, type NotificationSupport } from './support'

/** Current notification support plus a way to ask for permission. */
export function useNotificationSupport() {
  const [support, setSupport] = useState<NotificationSupport>(getNotificationSupport)

  // The user may change the permission in the system settings meanwhile.
  useEffect(() => {
    const refresh = () => {
      setSupport(getNotificationSupport())
    }
    document.addEventListener('visibilitychange', refresh)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  /** Must be called from a user gesture (a click), never on page load. */
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return
    try {
      setSupport(await Notification.requestPermission())
    } catch {
      setSupport(getNotificationSupport())
    }
  }, [])

  return { support, requestPermission }
}
