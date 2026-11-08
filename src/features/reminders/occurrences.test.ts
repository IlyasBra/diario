import { describe, expect, it } from 'vitest'

import { makeReminder } from '@/test/factories'

import { getNextOccurrence, getOccurrencesBetween } from './occurrences'

/** Local date helper: month is 1-based to keep tests readable. */
const at = (year: number, month: number, day: number, hours = 0, minutes = 0) =>
  new Date(year, month - 1, day, hours, minutes)

describe('getOccurrencesBetween', () => {
  it('returns a one-off reminder only when it falls in the range', () => {
    const itv = makeReminder({ date: '2026-11-20', time: '09:00', repeat: 'none' })

    expect(getOccurrencesBetween(itv, at(2026, 11, 1), at(2026, 11, 30))).toEqual([
      at(2026, 11, 20, 9),
    ])
    expect(getOccurrencesBetween(itv, at(2026, 12, 1), at(2026, 12, 31))).toEqual([])
  })

  it('repeats monthly on the same day', () => {
    const rent = makeReminder({ date: '2026-01-05', time: '08:00', repeat: 'monthly' })

    expect(getOccurrencesBetween(rent, at(2026, 11, 1), at(2027, 1, 31))).toEqual([
      at(2026, 11, 5, 8),
      at(2026, 12, 5, 8),
      at(2027, 1, 5, 8),
    ])
  })

  it('moves the 31st to the last day of shorter months and back again', () => {
    const payment = makeReminder({ date: '2026-01-31', time: '10:00', repeat: 'monthly' })

    expect(getOccurrencesBetween(payment, at(2026, 2, 1), at(2026, 5, 31, 23, 59))).toEqual([
      at(2026, 2, 28, 10),
      at(2026, 3, 31, 10),
      at(2026, 4, 30, 10),
      at(2026, 5, 31, 10),
    ])
  })

  it('repeats yearly, using 28 February for 29 February in non-leap years', () => {
    const birthday = makeReminder({ date: '2024-02-29', time: '09:00', repeat: 'yearly' })

    expect(getOccurrencesBetween(birthday, at(2026, 1, 1), at(2028, 12, 31))).toEqual([
      at(2026, 2, 28, 9),
      at(2027, 2, 28, 9),
      at(2028, 2, 29, 9),
    ])
  })

  it('never returns occurrences before the original date', () => {
    const future = makeReminder({ date: '2027-03-10', time: '12:00', repeat: 'monthly' })

    expect(getOccurrencesBetween(future, at(2026, 1, 1), at(2027, 3, 31))).toEqual([
      at(2027, 3, 10, 12),
    ])
  })

  it('includes both ends of the range', () => {
    const monthly = makeReminder({ date: '2026-11-08', time: '09:00', repeat: 'monthly' })

    expect(getOccurrencesBetween(monthly, at(2026, 11, 8, 9), at(2026, 12, 8, 9))).toHaveLength(2)
  })
})

describe('getNextOccurrence', () => {
  it('finds the next birthday after this year has passed', () => {
    const birthday = makeReminder({ date: '1990-03-15', time: '09:00', repeat: 'yearly' })

    expect(getNextOccurrence(birthday, at(2026, 11, 8))).toEqual(at(2027, 3, 15, 9))
  })

  it('returns null for a one-off reminder in the past', () => {
    const past = makeReminder({ date: '2026-10-01', time: '09:00', repeat: 'none' })

    expect(getNextOccurrence(past, at(2026, 11, 8))).toBeNull()
  })
})
