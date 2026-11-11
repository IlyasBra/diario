import { addDays, format, isValid, parse } from 'date-fns'

import { getLanguage, intlLocale, t } from '@/i18n'

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

const formatters = new Map<string, Intl.DateTimeFormat>()

/** Intl formatter in the current language; cached because lists format many dates. */
function dateFormatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const locale = intlLocale(getLanguage())
  const cacheKey = `${locale}|${JSON.stringify(options)}`
  let formatter = formatters.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options)
    formatters.set(cacheKey, formatter)
  }
  return formatter
}

/** "sábado, 7 de noviembre" (in the current language). */
export function formatLongDate(date: Date, withYear = false): string {
  return dateFormatter({
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(withYear && { year: 'numeric' }),
  }).format(date)
}

/** "7 nov" */
export function formatShortDate(value: ISODate): string {
  return dateFormatter({ day: 'numeric', month: 'short' }).format(parseISODate(value))
}

/** "noviembre de 2026" */
export function formatMonthYear(value: ISODate): string {
  return dateFormatter({ month: 'long', year: 'numeric' }).format(parseISODate(value))
}

/** Name of a weekday: "lunes" (long), "lun" (short) or "L" (narrow). */
export function formatWeekday(date: Date, width: 'long' | 'short' | 'narrow'): string {
  return dateFormatter({ weekday: width }).format(date)
}

/** "lunes y jueves": a list joined the way the current language does it. */
export function formatList(items: readonly string[]): string {
  return new Intl.ListFormat(intlLocale(getLanguage()), {
    style: 'long',
    type: 'conjunction',
  }).format(items)
}

/**
 * "Hoy", "Mañana" or "lunes, 10 de noviembre" relative to `today`; adds the
 * year when it is not the current one ("miércoles, 20 de enero de 2027").
 */
export function formatDayHeading(value: ISODate, today: ISODate): string {
  if (value === today) return t('day.today')
  if (value === addDaysToISODate(today, 1)) return t('day.tomorrow')
  return formatLongDate(parseISODate(value), value.slice(0, 4) !== today.slice(0, 4))
}

/** "09:05" for a Date, in 24h format. */
export function formatTime(date: Date): string {
  return format(date, 'HH:mm')
}
