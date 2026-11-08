import { addDays, format, isValid, parse } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * A calendar day as "yyyy-MM-dd".
 *
 * Tasks belong to a day, not to an instant, so we store plain date strings
 * instead of Date objects. They have no time zone, survive JSON round-trips
 * and compare correctly with < and > because the format is zero-padded.
 */
export type ISODate = string

/** A time of day as "HH:mm" (24h), the format of <input type="time">. */
export type TimeString = string

const ISO_DATE_FORMAT = 'yyyy-MM-dd'

/** Local calendar date as "yyyy-MM-dd" (no UTC shift, unlike toISOString). */
export function toISODate(date: Date): ISODate {
  return format(date, ISO_DATE_FORMAT)
}

/** Parses "yyyy-MM-dd" as a local date at midnight. */
export function parseISODate(value: ISODate): Date {
  const date = parse(value, ISO_DATE_FORMAT, new Date())
  if (!isValid(date)) throw new Error(`Invalid ISO date: "${value}"`)
  return date
}

export function isISODate(value: string): value is ISODate {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parse(value, ISO_DATE_FORMAT, new Date()))
}

export function isTimeString(value: string): value is TimeString {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

/** Local Date for a calendar day at a given time. */
export function combineDateAndTime(date: ISODate, time: TimeString): Date {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  const result = parseISODate(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

export function addDaysToISODate(value: ISODate, amount: number): ISODate {
  return toISODate(addDays(parseISODate(value), amount))
}

/** "sábado, 7 de noviembre" */
export function formatLongDate(date: Date): string {
  return format(date, "EEEE, d 'de' MMMM", { locale: es })
}

/** "7 nov" */
export function formatShortDate(value: ISODate): string {
  return format(parseISODate(value), 'd MMM', { locale: es })
}

/** "Hoy", "Mañana" or "lunes, 10 de noviembre" relative to `today`. */
export function formatDayHeading(value: ISODate, today: ISODate): string {
  if (value === today) return 'Hoy'
  if (value === addDaysToISODate(today, 1)) return 'Mañana'
  return formatLongDate(parseISODate(value))
}
