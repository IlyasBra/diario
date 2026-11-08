import { describe, expect, it } from 'vitest'

import { makeReminder } from '@/test/factories'

import {
  getRangeBounds,
  groupByDay,
  selectAllReminders,
  selectOccurrencesBetween,
} from './selectors'

// Wednesday 11 November 2026, 12:00.
const NOW = new Date(2026, 10, 11, 12, 0)

describe('getRangeBounds', () => {
  it('covers from today at midnight to Sunday night for "this week"', () => {
    const { start, end } = getRangeBounds('week', NOW)
    expect(start).toEqual(new Date(2026, 10, 11, 0, 0))
    expect(end).toEqual(new Date(2026, 10, 15, 23, 59, 59, 999))
  })

  it('covers until the last day of the month for "this month"', () => {
    expect(getRangeBounds('month', NOW).end).toEqual(new Date(2026, 10, 30, 23, 59, 59, 999))
  })
})

describe('selectOccurrencesBetween', () => {
  it('keeps this morning, drops next week and sorts by time', () => {
    const thisMorning = makeReminder({ title: 'Pastilla', date: '2026-11-11', time: '08:00' })
    const friday = makeReminder({ title: 'ITV', date: '2026-11-13', time: '10:00' })
    const nextWeek = makeReminder({ title: 'Dentista', date: '2026-11-17', time: '10:00' })
    const { start, end } = getRangeBounds('week', NOW)

    const titles = selectOccurrencesBetween([nextWeek, friday, thisMorning], start, end).map(
      (occurrence) => occurrence.reminder.title,
    )

    expect(titles).toEqual(['Pastilla', 'ITV'])
  })
})

describe('selectAllReminders', () => {
  it('splits upcoming occurrences from past one-off reminders', () => {
    const birthday = makeReminder({ title: 'Cumple', date: '1995-01-20', repeat: 'yearly' })
    const itv = makeReminder({ title: 'ITV', date: '2026-12-01' })
    const oldDni = makeReminder({ title: 'DNI', date: '2026-10-01' })

    const { upcoming, past } = selectAllReminders([birthday, itv, oldDni], NOW)

    expect(upcoming.map((o) => [o.reminder.title, o.at])).toEqual([
      ['ITV', new Date(2026, 11, 1, 9, 0)],
      ['Cumple', new Date(2027, 0, 20, 9, 0)],
    ])
    expect(past.map((o) => o.reminder.title)).toEqual(['DNI'])
  })
})

describe('groupByDay', () => {
  it('groups consecutive occurrences of the same day', () => {
    const a = { reminder: makeReminder(), at: new Date(2026, 10, 12, 9) }
    const b = { reminder: makeReminder(), at: new Date(2026, 10, 12, 18) }
    const c = { reminder: makeReminder(), at: new Date(2026, 10, 14, 9) }

    expect(groupByDay([a, b, c])).toEqual([
      { date: '2026-11-12', occurrences: [a, b] },
      { date: '2026-11-14', occurrences: [c] },
    ])
  })
})
