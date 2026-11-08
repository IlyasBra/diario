import { describe, expect, it } from 'vitest'

import { makeReminder, makeTask } from '@/test/factories'

import { collectDueAlerts, INITIAL_SCHEDULER_STATE, planAlerts } from './alerts'

const at = (day: number, hours: number, minutes = 0) => new Date(2026, 10, day, hours, minutes)

describe('collectDueAlerts', () => {
  it('includes reminders and timed pending tasks due in (from, to]', () => {
    const reminder = makeReminder({ id: 'r1', title: 'ITV', date: '2026-11-11', time: '10:00' })
    const task = makeTask({ id: 't1', title: 'Dentista', date: '2026-11-11', time: '10:30' })
    const untimed = makeTask({ date: '2026-11-11', time: null })
    const done = makeTask({ date: '2026-11-11', time: '10:15', completed: true })

    const alerts = collectDueAlerts([reminder], [task, untimed, done], at(11, 9), at(11, 11))

    expect(alerts).toEqual([
      {
        key: `reminder:r1:${at(11, 10).toISOString()}`,
        title: 'ITV',
        body: 'Recordatorio · 10:00',
        at: at(11, 10),
      },
      {
        key: 'task:t1:2026-11-11T10:30',
        title: 'Dentista',
        body: 'Tarea · 10:30',
        at: at(11, 10, 30),
      },
    ])
  })

  it('excludes the start of the window so an alert is not repeated', () => {
    const reminder = makeReminder({ date: '2026-11-11', time: '10:00' })

    expect(collectDueAlerts([reminder], [], at(11, 10), at(11, 11))).toEqual([])
    expect(collectDueAlerts([reminder], [], at(11, 9), at(11, 10))).toHaveLength(1)
  })

  it('adds the note to the body', () => {
    const reminder = makeReminder({ date: '2026-11-11', time: '10:00', note: 'Llevar papeles' })

    expect(collectDueAlerts([reminder], [], at(11, 9), at(11, 11))[0]?.body).toBe(
      'Recordatorio · 10:00\nLlevar papeles',
    )
  })
})

describe('planAlerts', () => {
  const reminder = makeReminder({ id: 'r1', date: '2026-11-11', time: '10:00' })

  it('does not deliver old alerts on the very first run', () => {
    const { alerts, nextState } = planAlerts(INITIAL_SCHEDULER_STATE, at(11, 12), [reminder], [])

    expect(alerts).toEqual([])
    expect(nextState.lastCheckedAt).toBe(at(11, 12).toISOString())
  })

  it('delivers alerts that became due since the last check, only once', () => {
    const first = planAlerts(
      { lastCheckedAt: at(11, 9, 59).toISOString(), delivered: [] },
      at(11, 10, 0),
      [reminder],
      [],
    )
    expect(first.alerts).toHaveLength(1)

    // Same window again (e.g. two tabs): already delivered.
    const again = planAlerts(
      { ...first.nextState, lastCheckedAt: at(11, 9, 59).toISOString() },
      at(11, 10, 0),
      [reminder],
      [],
    )
    expect(again.alerts).toEqual([])
  })

  it('catches up on alerts missed while the app was closed, up to 12 hours', () => {
    const lastWeek = { lastCheckedAt: at(4, 9).toISOString(), delivered: [] }
    const missed = makeReminder({ date: '2026-11-11', time: '07:00' })
    const tooOld = makeReminder({ date: '2026-11-10', time: '20:00' })

    const { alerts } = planAlerts(lastWeek, at(11, 12), [missed, tooOld], [])

    expect(alerts.map((alert) => alert.at)).toEqual([at(11, 7)])
  })
})
