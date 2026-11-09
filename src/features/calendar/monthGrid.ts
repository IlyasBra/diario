import { addMonths, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'

import { addDaysToISODate, type ISODate, parseISODate, toISODate } from '@/lib/dates'

/** First day of the month containing `date`. */
export function firstOfMonth(date: ISODate): ISODate {
  return toISODate(startOfMonth(parseISODate(date)))
}

/** The first day of the month `amount` months after (or before) `date`'s month. */
export function shiftMonth(date: ISODate, amount: number): ISODate {
  return toISODate(addMonths(startOfMonth(parseISODate(date)), amount))
}

/** "noviembre de 2026" */
export function formatMonthTitle(date: ISODate): string {
  return format(parseISODate(date), "LLLL 'de' yyyy", { locale: es })
}

/**
 * The weeks to draw for the month of `date`, Monday first. The first and
 * last rows include days of the neighbouring months.
 */
export function buildMonthGrid(date: ISODate): ISODate[][] {
  const month = parseISODate(date)
  const first = toISODate(startOfWeek(startOfMonth(month), { weekStartsOn: 1 }))
  const last = toISODate(endOfWeek(endOfMonth(month), { weekStartsOn: 1 }))

  const weeks: ISODate[][] = []
  for (let day = first; day <= last; day = addDaysToISODate(day, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, index) => addDaysToISODate(day, index)))
  }
  return weeks
}
