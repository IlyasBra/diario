import { type Task } from '@/features/tasks/types'
import { addDaysToISODate, type ISODate, toISODate } from '@/lib/dates'
import { startOfWeek } from 'date-fns'

import { parseISODate } from '@/lib/dates'

/** Completed items per day. A repeating task counts once per completed day. */
export function completionsByDay(tasks: readonly Task[]): Map<ISODate, number> {
  const counts = new Map<ISODate, number>()
  const add = (day: ISODate) => {
    counts.set(day, (counts.get(day) ?? 0) + 1)
  }

  for (const task of tasks) {
    if (task.repeat.kind !== 'none') {
      for (const day of task.doneDates) add(day)
    } else if (task.completed && task.completedAt !== null) {
      // The day the user completed it (local time), not the day it was planned for.
      add(toISODate(new Date(task.completedAt)))
    }
  }
  return counts
}

/**
 * Consecutive days with at least one completed task, ending today. If
 * nothing is done yet today the streak is not lost: it counts up to yesterday.
 */
export function currentStreak(counts: ReadonlyMap<ISODate, number>, today: ISODate): number {
  let day = (counts.get(today) ?? 0) > 0 ? today : addDaysToISODate(today, -1)
  let streak = 0
  while ((counts.get(day) ?? 0) > 0) {
    streak += 1
    day = addDaysToISODate(day, -1)
  }
  return streak
}

/** The longest run of consecutive days with completed tasks. */
export function bestStreak(counts: ReadonlyMap<ISODate, number>): number {
  const days = [...counts.entries()]
    .filter(([, count]) => count > 0)
    .map(([day]) => day)
    .sort()

  let best = 0
  let run = 0
  let previous: ISODate | null = null
  for (const day of days) {
    run = previous !== null && addDaysToISODate(previous, 1) === day ? run + 1 : 1
    best = Math.max(best, run)
    previous = day
  }
  return best
}

export interface DayCount {
  date: ISODate
  count: number
}

/** The last `days` days ending today, oldest first, zeros included. */
export function lastDays(
  counts: ReadonlyMap<ISODate, number>,
  today: ISODate,
  days: number,
): DayCount[] {
  return Array.from({ length: days }, (_, index) => {
    const date = addDaysToISODate(today, index - (days - 1))
    return { date, count: counts.get(date) ?? 0 }
  })
}

/** Sum of completions from `from` to `to`, both inclusive. */
export function totalBetween(
  counts: ReadonlyMap<ISODate, number>,
  from: ISODate,
  to: ISODate,
): number {
  let total = 0
  for (const [day, count] of counts) if (day >= from && day <= to) total += count
  return total
}

/** The Monday of the week containing `date`. */
export function startOfWeekISO(date: ISODate): ISODate {
  return toISODate(startOfWeek(parseISODate(date), { weekStartsOn: 1 }))
}

export interface TagCount {
  tagId: string
  count: number
}

/** Completions per tag between two days, most first. */
export function completionsByTag(tasks: readonly Task[], from: ISODate, to: ISODate): TagCount[] {
  const counts = new Map<string, number>()
  for (const task of tasks) {
    const total = totalBetween(completionsByDay([task]), from, to)
    if (total > 0) counts.set(task.tag, (counts.get(task.tag) ?? 0) + total)
  }
  return [...counts.entries()]
    .map(([tagId, count]) => ({ tagId, count }))
    .sort((a, b) => b.count - a.count)
}
