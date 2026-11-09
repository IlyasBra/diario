import { addMonths, getDay } from 'date-fns'

import { addDaysToISODate, type ISODate, parseISODate, toISODate } from '@/lib/dates'

import { type Task, type WeekdayIndex } from './types'

export const WEEKDAY_LABELS = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
] as const

/** One letter per weekday, Monday first ("X" for miércoles, as in Spanish calendars). */
export const WEEKDAY_INITIALS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const

export const WEEKDAYS: readonly WeekdayIndex[] = [0, 1, 2, 3, 4, 5, 6]

export function isRecurring(task: Task): boolean {
  return task.repeat.kind !== 'none'
}

/** 0 = Monday … 6 = Sunday. date-fns/JS use 0 = Sunday. */
export function weekdayIndex(date: ISODate): WeekdayIndex {
  return ((getDay(parseISODate(date)) + 6) % 7) as WeekdayIndex
}

/** Whether the task is planned on `date` (for one-off tasks: its own day). */
export function occursOn(task: Task, date: ISODate): boolean {
  const { repeat } = task
  if (repeat.kind === 'none') return task.date === date
  if (date < task.date) return false

  switch (repeat.kind) {
    case 'daily':
      return true
    case 'weekly':
      return repeat.days.includes(weekdayIndex(date))
    case 'monthly': {
      // Always computed from the start date, never chained, so the 31st
      // returns to the 31st after a 30-day month.
      const start = parseISODate(task.date)
      const target = parseISODate(date)
      const months =
        (target.getFullYear() - start.getFullYear()) * 12 + target.getMonth() - start.getMonth()
      return toISODate(addMonths(start, months)) === date
    }
  }
}

/** Every day in [from, to] (inclusive) on which the task occurs. */
export function occurrenceDates(task: Task, from: ISODate, to: ISODate): ISODate[] {
  if (task.repeat.kind === 'none') return task.date >= from && task.date <= to ? [task.date] : []

  const dates: ISODate[] = []
  for (let day = from < task.date ? task.date : from; day <= to; day = addDaysToISODate(day, 1)) {
    if (occursOn(task, day)) dates.push(day)
  }
  return dates
}

/**
 * The task as it appears on `date`. For repeating tasks `date` and
 * `completed` describe that day's occurrence; one-off tasks are returned
 * unchanged. The stored task is never modified.
 */
export function projectOccurrence(task: Task, date: ISODate): Task {
  if (!isRecurring(task)) return task
  const completed = task.doneDates.includes(date)
  return { ...task, date, completed, completedAt: completed ? task.updatedAt : null }
}

/** Adds or removes `date` from the completed days. */
export function toggleDoneDate(doneDates: readonly ISODate[], date: ISODate): ISODate[] {
  return doneDates.includes(date)
    ? doneDates.filter((done) => done !== date)
    : [...doneDates, date].sort()
}

/** "Cada día", "Cada semana: lunes y jueves", "Cada mes". */
export function describeRepeat(task: Pick<Task, 'repeat'>): string {
  const { repeat } = task
  switch (repeat.kind) {
    case 'none':
      return 'No se repite'
    case 'daily':
      return 'Cada día'
    case 'monthly':
      return 'Cada mes'
    case 'weekly': {
      const names = [...repeat.days].sort().map((day) => WEEKDAY_LABELS[day])
      if (names.length === 7) return 'Cada día'
      const list =
        names.length > 1
          ? `${names.slice(0, -1).join(', ')} y ${names.at(-1) ?? ''}`
          : (names[0] ?? '')
      return `Cada ${list}`
    }
  }
}

/** First day on or after `from` (within a year) on which the task occurs. */
export function nextOccurrence(task: Task, from: ISODate): ISODate | null {
  return occurrenceDates(task, from, addDaysToISODate(from, 366))[0] ?? null
}
