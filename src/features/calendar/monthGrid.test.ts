import { describe, expect, it } from 'vitest'

import { buildMonthGrid, firstOfMonth, formatMonthTitle, shiftMonth } from './monthGrid'

describe('buildMonthGrid', () => {
  it('starts on Monday and covers whole weeks (November 2026)', () => {
    const weeks = buildMonthGrid('2026-11-15')

    expect(weeks).toHaveLength(6) // 1 nov 2026 is a Sunday: the first row starts on Monday 26 oct
    expect(weeks[0]?.[0]).toBe('2026-10-26')
    expect(weeks.every((week) => week.length === 7)).toBe(true)
  })

  it('includes the days of the previous month in the first row', () => {
    const weeks = buildMonthGrid('2026-11-15')
    expect(weeks[0]).toEqual([
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
    ])
    expect(weeks.at(-1)?.at(-1)).toBe('2026-12-06')
  })

  it('needs six rows when the month spans six weeks (May 2027)', () => {
    expect(buildMonthGrid('2027-05-01')).toHaveLength(6)
  })
})

describe('month helpers', () => {
  it('moves between months, across years', () => {
    expect(firstOfMonth('2026-11-18')).toBe('2026-11-01')
    expect(shiftMonth('2026-11-18', 1)).toBe('2026-12-01')
    expect(shiftMonth('2026-12-31', 1)).toBe('2027-01-01')
    expect(shiftMonth('2026-01-31', -1)).toBe('2025-12-01')
  })

  it('formats the title in Spanish', () => {
    expect(formatMonthTitle('2026-11-01')).toBe('noviembre de 2026')
  })
})
