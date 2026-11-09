import { describe, expect, it } from 'vitest'

import { makeTask } from '@/test/factories'

import {
  bestStreak,
  completionsByDay,
  completionsByTag,
  currentStreak,
  lastDays,
  startOfWeekISO,
  totalBetween,
} from './stats'

/** A one-off task completed at local noon on the given day. */
function doneOn(date: string, overrides = {}) {
  const completedAt = new Date(`${date}T12:00:00`).toISOString()
  return makeTask({ completed: true, completedAt, ...overrides })
}

describe('completionsByDay', () => {
  it('counts one-off tasks on the day they were completed, not planned', () => {
    const task = doneOn('2026-11-08', { date: '2026-11-01' })

    expect([...completionsByDay([task])]).toEqual([['2026-11-08', 1]])
  })

  it('counts each completed day of a repeating task, and ignores pending tasks', () => {
    const repeating = makeTask({
      repeat: { kind: 'daily' },
      doneDates: ['2026-11-06', '2026-11-07'],
    })

    const counts = completionsByDay([repeating, makeTask(), doneOn('2026-11-07')])

    expect(counts.get('2026-11-06')).toBe(1)
    expect(counts.get('2026-11-07')).toBe(2)
    expect(counts.size).toBe(2)
  })
})

describe('streaks', () => {
  const counts = completionsByDay([
    doneOn('2026-11-03'),
    doneOn('2026-11-06'),
    doneOn('2026-11-07'),
    doneOn('2026-11-08'),
    doneOn('2026-11-08'),
  ])

  it('counts consecutive days up to today', () => {
    expect(currentStreak(counts, '2026-11-08')).toBe(3)
  })

  it('does not lose the streak until a full day passes without completing anything', () => {
    expect(currentStreak(counts, '2026-11-09')).toBe(3) // nothing done yet today
    expect(currentStreak(counts, '2026-11-10')).toBe(0)
  })

  it('finds the best streak ever', () => {
    expect(bestStreak(counts)).toBe(3)
    expect(bestStreak(new Map())).toBe(0)
  })
})

describe('ranges', () => {
  const counts = completionsByDay([
    doneOn('2026-11-02'),
    doneOn('2026-11-08'),
    doneOn('2026-11-08'),
  ])

  it('lists the last days with zeros, oldest first', () => {
    expect(lastDays(counts, '2026-11-08', 3)).toEqual([
      { date: '2026-11-06', count: 0 },
      { date: '2026-11-07', count: 0 },
      { date: '2026-11-08', count: 2 },
    ])
  })

  it('sums an inclusive range', () => {
    expect(totalBetween(counts, '2026-11-02', '2026-11-08')).toBe(3)
    expect(totalBetween(counts, '2026-11-03', '2026-11-07')).toBe(0)
  })

  it('finds the Monday of a week', () => {
    expect(startOfWeekISO('2026-11-08')).toBe('2026-11-02') // domingo
    expect(startOfWeekISO('2026-11-02')).toBe('2026-11-02')
  })
})

describe('completionsByTag', () => {
  it('ranks tags by completions in the range', () => {
    const tasks = [
      doneOn('2026-11-05', { tag: 'work' }),
      doneOn('2026-11-06', { tag: 'work' }),
      doneOn('2026-11-06', { tag: 'home' }),
      doneOn('2026-10-01', { tag: 'home' }), // outside the range
    ]

    expect(completionsByTag(tasks, '2026-11-01', '2026-11-08')).toEqual([
      { tagId: 'work', count: 2 },
      { tagId: 'home', count: 1 },
    ])
  })
})
