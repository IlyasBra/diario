import { describe, expect, it } from 'vitest'

import { makeTask } from '@/test/factories'

import { isOverdue, selectTodayTasks, selectUpcomingGroups, summarizeDay } from './selectors'

const TODAY = '2026-11-08'

describe('isOverdue', () => {
  it('is true only for pending tasks from previous days', () => {
    expect(isOverdue(makeTask({ date: '2026-11-07' }), TODAY)).toBe(true)
    expect(isOverdue(makeTask({ date: '2026-11-07', completed: true }), TODAY)).toBe(false)
    expect(isOverdue(makeTask({ date: TODAY }), TODAY)).toBe(false)
    expect(isOverdue(makeTask({ date: '2026-11-09' }), TODAY)).toBe(false)
  })
})

describe('selectTodayTasks', () => {
  it('splits overdue and today tasks and ignores future ones', () => {
    const old = makeTask({ title: 'Atrasada', date: '2026-11-01' })
    const oldDone = makeTask({ date: '2026-11-01', completed: true })
    const today = makeTask({ title: 'De hoy', date: TODAY })
    const future = makeTask({ date: '2026-11-20' })

    const result = selectTodayTasks([future, today, oldDone, old], TODAY)

    expect(result.overdue).toEqual([old])
    expect(result.today).toEqual([today])
  })

  it('orders overdue tasks from the oldest day', () => {
    const yesterday = makeTask({ date: '2026-11-07' })
    const lastWeek = makeTask({ date: '2026-11-01' })

    expect(selectTodayTasks([yesterday, lastWeek], TODAY).overdue).toEqual([lastWeek, yesterday])
  })

  it('puts timed tasks first, earliest first, before untimed ones', () => {
    const untimedHigh = makeTask({ date: TODAY, priority: 'high' })
    const late = makeTask({ date: TODAY, time: '18:00', priority: 'low' })
    const early = makeTask({ date: TODAY, time: '09:30', priority: 'low' })

    expect(selectTodayTasks([untimedHigh, late, early], TODAY).today).toEqual([
      early,
      late,
      untimedHigh,
    ])
  })

  it('puts pending tasks first, then sorts by priority', () => {
    const done = makeTask({ date: TODAY, priority: 'high', completed: true })
    const low = makeTask({ date: TODAY, priority: 'low' })
    const high = makeTask({ date: TODAY, priority: 'high' })

    expect(selectTodayTasks([done, low, high], TODAY).today).toEqual([high, low, done])
  })
})

describe('selectUpcomingGroups', () => {
  it('groups future tasks by day in chronological order', () => {
    const a = makeTask({ date: '2026-11-10' })
    const b = makeTask({ date: '2026-11-09' })
    const c = makeTask({ date: '2026-11-10' })
    const past = makeTask({ date: TODAY })

    expect(selectUpcomingGroups([a, b, c, past], TODAY)).toEqual([
      { date: '2026-11-09', tasks: [b] },
      { date: '2026-11-10', tasks: [a, c] },
    ])
  })

  it('returns an empty list when nothing is planned', () => {
    expect(selectUpcomingGroups([], TODAY)).toEqual([])
  })
})

describe('summarizeDay', () => {
  it('counts today tasks, completed ones and overdue ones', () => {
    const tasks = [
      makeTask({ date: TODAY }),
      makeTask({ date: TODAY, completed: true }),
      makeTask({ date: '2026-11-07' }),
      makeTask({ date: '2026-11-12' }),
    ]

    expect(summarizeDay(tasks, TODAY)).toEqual({ total: 2, completed: 1, overdue: 1 })
  })
})

describe('repeating tasks', () => {
  const daily = makeTask({
    title: 'Beber agua',
    date: '2026-11-01',
    repeat: { kind: 'daily' },
    doneDates: ['2026-11-08'],
  })

  it("appear today with that day's completion and are never overdue", () => {
    const result = selectTodayTasks([daily], TODAY)

    expect(result.overdue).toEqual([])
    expect(result.today).toMatchObject([{ title: 'Beber agua', date: TODAY, completed: true }])
  })

  it('are listed for the next two weeks in the upcoming view', () => {
    const groups = selectUpcomingGroups([daily], TODAY)

    expect(groups).toHaveLength(14)
    expect(groups[0]).toMatchObject({ date: '2026-11-09' })
    expect(groups[0]?.tasks[0]).toMatchObject({ completed: false })
    expect(groups.at(-1)?.date).toBe('2026-11-22')
  })

  it('count in the day summary', () => {
    expect(summarizeDay([daily, makeTask({ date: TODAY })], TODAY)).toEqual({
      total: 2,
      completed: 1,
      overdue: 0,
    })
  })
})
