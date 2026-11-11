import { getOccurrencesBetween } from '@/features/reminders/occurrences'
import { type Reminder } from '@/features/reminders/types'
import { selectTasksOnDay } from '@/features/tasks/selectors'
import { type Task } from '@/features/tasks/types'
import { t } from '@/i18n'
import { addDaysToISODate, combineDateAndTime, formatTime, toISODate } from '@/lib/dates'

export interface Alert {
  /** Unique per occurrence, used to never notify the same thing twice. */
  key: string
  title: string
  body: string
  at: Date
}

/**
 * Everything that becomes due in (from, to]: reminder occurrences and
 * pending tasks that have a time. Pure, so it is easy to test.
 */
export function collectDueAlerts(
  reminders: readonly Reminder[],
  tasks: readonly Task[],
  from: Date,
  to: Date,
): Alert[] {
  const afterFrom = new Date(from.getTime() + 1)
  const alerts: Alert[] = []

  for (const reminder of reminders) {
    for (const at of getOccurrencesBetween(reminder, afterFrom, to)) {
      alerts.push({
        key: `reminder:${reminder.id}:${at.toISOString()}`,
        title: reminder.title,
        body: [t('alerts.reminderBody', { time: formatTime(at) }), reminder.note]
          .filter(Boolean)
          .join('\n'),
        at,
      })
    }
  }

  // Day by day, so repeating tasks produce one alert per occurrence.
  const lastDay = toISODate(to)
  for (let day = toISODate(afterFrom); day <= lastDay; day = addDaysToISODate(day, 1)) {
    for (const task of selectTasksOnDay(tasks, day)) {
      if (task.completed || task.time === null) continue
      const at = combineDateAndTime(day, task.time)
      if (at < afterFrom || at > to) continue
      alerts.push({
        key: `task:${task.id}:${day}T${task.time}`,
        title: task.title,
        body: [t('alerts.taskBody', { time: task.time }), task.note].filter(Boolean).join('\n'),
        at,
      })
    }
  }

  return alerts.sort((a, b) => a.at.getTime() - b.at.getTime())
}

/** Device-local bookkeeping so alerts are delivered exactly once. */
export interface SchedulerState {
  /** ISO timestamp of the last check; null on the very first run. */
  lastCheckedAt: string | null
  /** Keys of alerts already delivered (most recent last, capped). */
  delivered: string[]
}

export const INITIAL_SCHEDULER_STATE: SchedulerState = { lastCheckedAt: null, delivered: [] }

/** How far back to look after the app was closed (missed alerts). */
export const CATCH_UP_MS = 12 * 60 * 60 * 1000
const MAX_DELIVERED_KEYS = 300

/**
 * Decides which alerts to deliver now and the next scheduler state.
 * On the first run nothing old is delivered, only what is due from now on.
 */
export function planAlerts(
  state: SchedulerState,
  now: Date,
  reminders: readonly Reminder[],
  tasks: readonly Task[],
): { alerts: Alert[]; nextState: SchedulerState } {
  const catchUpLimit = now.getTime() - CATCH_UP_MS
  const lastChecked = state.lastCheckedAt ? new Date(state.lastCheckedAt).getTime() : now.getTime()
  const from = new Date(Math.max(lastChecked, catchUpLimit))

  const delivered = new Set(state.delivered)
  const alerts = collectDueAlerts(reminders, tasks, from, now).filter(
    (alert) => !delivered.has(alert.key),
  )

  return {
    alerts,
    nextState: {
      lastCheckedAt: now.toISOString(),
      delivered: [...state.delivered, ...alerts.map((alert) => alert.key)].slice(
        -MAX_DELIVERED_KEYS,
      ),
    },
  }
}
