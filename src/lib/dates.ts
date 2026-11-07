import { format } from 'date-fns'
import { es } from 'date-fns/locale'

/** Local calendar date as "yyyy-MM-dd" (no UTC shift, unlike toISOString). */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** "sábado, 7 de noviembre" */
export function formatLongDate(date: Date): string {
  return format(date, "EEEE, d 'de' MMMM", { locale: es })
}
