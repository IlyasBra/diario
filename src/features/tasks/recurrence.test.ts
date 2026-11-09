import { describe, expect, it } from 'vitest'

import { makeTask } from '@/test/factories'

import {
  describeRepeat,
  occurrenceDates,
  occursOn,
  projectOccurrence,
  toggleDoneDate,
  weekdayIndex,
} from './recurrence'
import { type TaskRepeat } from './types'

describe('weekdayIndex', () => {
  it('starts the week on Monday', () => {
    expect(weekdayIndex('2026-11-09')).toBe(0) // lunes
    expect(weekdayIndex('2026-11-15')).toBe(6) // domingo
  })
})

describe('occursOn', () => {
  it('one-off tasks occur only on their day', () => {
    const task = makeTask({ date: '2026-11-10' })
    expect(occursOn(task, '2026-11-10')).toBe(true)
    expect(occursOn(task, '2026-11-11')).toBe(false)
  })

  it('daily tasks occur every day from the start date', () => {
    const task = makeTask({ date: '2026-11-10', repeat: { kind: 'daily' } })
    expect(occursOn(task, '2026-11-09')).toBe(false)
    expect(occursOn(task, '2026-11-10')).toBe(true)
    expect(occursOn(task, '2027-03-01')).toBe(true)
  })

  it('weekly tasks occur on the chosen weekdays (Monday and Thursday)', () => {
    const task = makeTask({ date: '2026-11-02', repeat: { kind: 'weekly', days: [0, 3] } })
    expect(occurrenceDates(task, '2026-11-09', '2026-11-15')).toEqual(['2026-11-09', '2026-11-12'])
  })

  it('monthly tasks use the start day and clamp short months without drifting', () => {
    const task = makeTask({ date: '2026-01-31', repeat: { kind: 'monthly' } })
    expect(occursOn(task, '2026-02-28')).toBe(true)
    expect(occursOn(task, '2026-02-27')).toBe(false)
    expect(occursOn(task, '2026-04-30')).toBe(true)
    expect(occursOn(task, '2026-05-31')).toBe(true) // back to the 31st
    expect(occursOn(task, '2026-05-30')).toBe(false)
  })
})

describe('occurrenceDates', () => {
  it('never lists days before the start date', () => {
    const task = makeTask({ date: '2026-11-12', repeat: { kind: 'daily' } })
    expect(occurrenceDates(task, '2026-11-10', '2026-11-13')).toEqual(['2026-11-12', '2026-11-13'])
  })
})

describe('projectOccurrence', () => {
  it('reflects completion of that day only', () => {
    const task = makeTask({
      date: '2026-11-01',
      repeat: { kind: 'daily' },
      doneDates: ['2026-11-09'],
    })

    expect(projectOccurrence(task, '2026-11-09')).toMatchObject({
      date: '2026-11-09',
      completed: true,
    })
    expect(projectOccurrence(task, '2026-11-10')).toMatchObject({
      date: '2026-11-10',
      completed: false,
    })
    expect(task.date).toBe('2026-11-01') // stored task untouched
  })

  it('returns one-off tasks unchanged', () => {
    const task = makeTask()
    expect(projectOccurrence(task, '2030-01-01')).toBe(task)
  })
})

describe('toggleDoneDate', () => {
  it('adds and removes a day keeping the list sorted', () => {
    expect(toggleDoneDate(['2026-11-10'], '2026-11-09')).toEqual(['2026-11-09', '2026-11-10'])
    expect(toggleDoneDate(['2026-11-09', '2026-11-10'], '2026-11-09')).toEqual(['2026-11-10'])
  })
})

describe('describeRepeat', () => {
  it.each([
    [{ kind: 'daily' }, 'Cada día'],
    [{ kind: 'monthly' }, 'Cada mes'],
    [{ kind: 'weekly', days: [0] }, 'Cada lunes'],
    [{ kind: 'weekly', days: [3, 0] }, 'Cada lunes y jueves'],
    [{ kind: 'weekly', days: [0, 2, 4] }, 'Cada lunes, miércoles y viernes'],
    [{ kind: 'weekly', days: [0, 1, 2, 3, 4, 5, 6] }, 'Cada día'],
  ] satisfies [TaskRepeat, string][])('%j → %s', (repeat, expected) => {
    expect(describeRepeat({ repeat })).toBe(expected)
  })
})
