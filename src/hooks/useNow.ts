import { useEffect, useState } from 'react'

/**
 * Current time, refreshed every `intervalMs` and whenever the app comes
 * back to the foreground (timers are paused while a phone app is hidden).
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const refresh = () => {
      setNow(new Date())
    }
    const interval = window.setInterval(refresh, intervalMs)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [intervalMs])

  return now
}
