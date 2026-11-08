import { addMonths, addYears, differenceInCalendarMonths } from 'date-fns'

import { combineDateAndTime } from '@/lib/dates'

import { type Reminder } from './types'

/** Safety net against infinite loops on absurd ranges. */
const MAX_OCCURRENCES = 1000

/**
 * The n-th occurrence, always computed from the original date (never by
 * chaining), so a reminder on the 31st falls on the 30th in April and goes
 * back to the 31st in May, and 29 February falls on the 28th in non-leap
 * years. date-fns clamps to the last valid day of the month.
 */
function nthOccurrence(reminder: Reminder, base: Date, n: number): Date {
  return reminder.repeat === 'yearly' ? addYears(base, n) : addMonths(base, n)
}

/** Every occurrence in [start, end], in chronological order. */
export function getOccurrencesBetween(reminder: Reminder, start: Date, end: Date): Date[] {
  const base = combineDateAndTime(reminder.date, reminder.time)

  if (reminder.repeat === 'none') {
    return base >= start && base <= end ? [base] : []
  }

  // Jump close to `start` instead of iterating from the original date.
  const monthsToStart = Math.max(0, differenceInCalendarMonths(start, base) - 1)
  let n = reminder.repeat === 'yearly' ? Math.floor(monthsToStart / 12) : monthsToStart

  const occurrences: Date[] = []
  for (let i = 0; i < MAX_OCCURRENCES; i += 1, n += 1) {
    const occurrence = nthOccurrence(reminder, base, n)
    if (occurrence > end) break
    if (occurrence >= start) occurrences.push(occurrence)
  }
  return occurrences
}

/** First occurrence at or after `from`, or null if there is none. */
export function getNextOccurrence(reminder: Reminder, from: Date): Date | null {
  const base = combineDateAndTime(reminder.date, reminder.time)
  if (reminder.repeat === 'none') return base >= from ? base : null

  const horizon = reminder.repeat === 'yearly' ? addYears(from, 1) : addMonths(from, 1)
  return getOccurrencesBetween(reminder, from, horizon)[0] ?? null
}
