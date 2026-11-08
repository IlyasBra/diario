import { describe, expect, it } from 'vitest'

import {
  addDaysToISODate,
  formatDayHeading,
  formatShortDate,
  combineDateAndTime,
  isISODate,
  isTimeString,
  parseISODate,
  toISODate,
} from './dates'

describe('dates', () => {
  it('formats a Date as a local yyyy-MM-dd string', () => {
    // 23:30 local time must stay on the same calendar day (no UTC shift).
    expect(toISODate(new Date(2026, 10, 8, 23, 30))).toBe('2026-11-08')
  })

  it('round-trips through parseISODate', () => {
    expect(toISODate(parseISODate('2026-02-28'))).toBe('2026-02-28')
  })

  it('rejects invalid dates', () => {
    expect(isISODate('2026-02-30')).toBe(false)
    expect(isISODate('08/11/2026')).toBe(false)
    expect(isISODate('2026-11-08')).toBe(true)
    expect(() => parseISODate('nope')).toThrow()
  })

  it('validates and combines times of day', () => {
    expect(isTimeString('09:05')).toBe(true)
    expect(isTimeString('9:05')).toBe(false)
    expect(isTimeString('24:00')).toBe(false)
    expect(combineDateAndTime('2026-11-08', '18:45')).toEqual(new Date(2026, 10, 8, 18, 45))
  })

  it('adds days across month and year boundaries', () => {
    expect(addDaysToISODate('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDaysToISODate('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDaysToISODate('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('names today and tomorrow, and spells out other days in Spanish', () => {
    expect(formatDayHeading('2026-11-08', '2026-11-08')).toBe('Hoy')
    expect(formatDayHeading('2026-11-09', '2026-11-08')).toBe('Mañana')
    expect(formatDayHeading('2026-11-10', '2026-11-08')).toBe('martes, 10 de noviembre')
    expect(formatShortDate('2026-11-05')).toBe('5 nov')
    expect(formatDayHeading('2027-01-20', '2026-11-08')).toBe('miércoles, 20 de enero de 2027')
  })
})
