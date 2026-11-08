import { endOfMonth, endOfWeek, startOfDay } from 'date-fns'

import { combineDateAndTime, type ISODate, toISODate } from '@/lib/dates'

import { getNextOccurrence, getOccurrencesBetween } from './occurrences'
import { type Reminder } from './types'

export interface ReminderOccurrence {
  reminder: Reminder
  at: Date
}

export type ReminderRange = 'week' | 'month' | 'all'

/**
 * Today (from midnight, so this morning's reminders still show) until the
 * end of the calendar week (Monday-based, as in Spain) or month.
 */
export function getRangeBounds(range: 'week' | 'month', now: Date): { start: Date; end: Date } {
  const start = startOfDay(now)
  const end = range === 'week' ? endOfWeek(now, { weekStartsOn: 1 }) : endOfMonth(now)
  return { start, end }
}

function byTime(a: ReminderOccurrence, b: ReminderOccurrence): number {
  return a.at.getTime() - b.at.getTime() || a.reminder.title.localeCompare(b.reminder.title)
}

export function selectOccurrencesBetween(
  reminders: readonly Reminder[],
  start: Date,
  end: Date,
): ReminderOccurrence[] {
  return reminders
    .flatMap((reminder) =>
      getOccurrencesBetween(reminder, start, end).map((at) => ({ reminder, at })),
    )
    .sort(byTime)
}

export interface AllReminders {
  /** Next occurrence of each reminder still to come (from today). */
  upcoming: ReminderOccurrence[]
  /** One-off reminders whose day has passed, most recent first. */
  past: ReminderOccurrence[]
}

export function selectAllReminders(reminders: readonly Reminder[], now: Date): AllReminders {
  const from = startOfDay(now)
  const upcoming: ReminderOccurrence[] = []
  const past: ReminderOccurrence[] = []

  for (const reminder of reminders) {
    const next = getNextOccurrence(reminder, from)
    if (next) upcoming.push({ reminder, at: next })
    else past.push({ reminder, at: combineDateAndTime(reminder.date, reminder.time) })
  }

  return { upcoming: upcoming.sort(byTime), past: past.sort(byTime).reverse() }
}

export interface OccurrenceGroup {
  date: ISODate
  occurrences: ReminderOccurrence[]
}

/** Groups already-sorted occurrences by calendar day. */
export function groupByDay(occurrences: readonly ReminderOccurrence[]): OccurrenceGroup[] {
  const groups: OccurrenceGroup[] = []
  for (const occurrence of occurrences) {
    const date = toISODate(occurrence.at)
    const last = groups.at(-1)
    if (last?.date === date) last.occurrences.push(occurrence)
    else groups.push({ date, occurrences: [occurrence] })
  }
  return groups
}
