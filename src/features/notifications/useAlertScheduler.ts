import { useCallback, useEffect, useRef, useState } from 'react'

import { type Reminder } from '@/features/reminders/types'
import { type Task } from '@/features/tasks/types'
import { readLocal, writeLocal } from '@/lib/localStore'

import { type Alert, INITIAL_SCHEDULER_STATE, planAlerts, type SchedulerState } from './alerts'
import { showSystemNotification } from './notifier'

const STORAGE_KEY = 'diario:alert-scheduler'
const CHECK_INTERVAL_MS = 30_000

/**
 * Checks every 30 s (and whenever the app returns to the foreground) for
 * reminders and timed tasks that just became due, and delivers each one
 * once: as a system notification when allowed, otherwise inside the app.
 *
 * Without a backend this only runs while the app is open or recently in
 * the background. Push from a server would be needed for a closed app.
 */
export function useAlertScheduler(
  reminders: readonly Reminder[],
  tasks: readonly Task[],
  enabled: boolean,
) {
  const [inAppAlerts, setInAppAlerts] = useState<Alert[]>([])

  // Read the latest data inside the interval without restarting it.
  const dataRef = useRef({ reminders, tasks })
  useEffect(() => {
    dataRef.current = { reminders, tasks }
  }, [reminders, tasks])

  useEffect(() => {
    if (!enabled) return

    const check = () => {
      const state = readLocal<SchedulerState>(STORAGE_KEY, INITIAL_SCHEDULER_STATE)
      const { alerts, nextState } = planAlerts(
        state,
        new Date(),
        dataRef.current.reminders,
        dataRef.current.tasks,
      )
      writeLocal(STORAGE_KEY, nextState)

      for (const alert of alerts) {
        void showSystemNotification(alert).then((shown) => {
          if (!shown) setInAppAlerts((current) => [...current, alert])
        })
      }
    }

    check()
    const interval = window.setInterval(check, CHECK_INTERVAL_MS)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [enabled])

  const dismissAlert = useCallback((key: string) => {
    setInAppAlerts((current) => current.filter((alert) => alert.key !== key))
  }, [])

  return { inAppAlerts, dismissAlert }
}
