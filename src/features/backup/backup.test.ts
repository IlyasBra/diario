import { describe, expect, it } from 'vitest'

import { makeReminder, makeTask } from '@/test/factories'

import { backupFileName, createBackup, parseBackup } from './backup'

const NOW = new Date('2026-11-09T21:30:00.000Z')

describe('backup', () => {
  it('round-trips tasks and reminders through JSON', () => {
    const tasks = [
      makeTask({ time: '10:30' }),
      makeTask({ completed: true, completedAt: NOW.toISOString() }),
    ]
    const reminders = [makeReminder({ repeat: 'monthly' })]

    const result = parseBackup(JSON.stringify(createBackup(tasks, reminders, NOW)))

    expect(result).toMatchObject({ ok: true, backup: { tasks, reminders } })
  })

  it('names the file after the export date', () => {
    expect(backupFileName(NOW)).toBe('diario-copia-2026-11-09.json')
  })

  it.each([
    ['not JSON', 'esto no es json'],
    ['another app', JSON.stringify({ app: 'otra', version: 1, tasks: [], reminders: [] })],
    ['a newer version', JSON.stringify({ ...createBackup([], [], NOW), version: 99 })],
    ['missing lists', JSON.stringify({ app: 'diario', version: 1, exportedAt: NOW.toISOString() })],
    ['an array', '[]'],
  ])('rejects %s', (_name, text) => {
    expect(parseBackup(text).ok).toBe(false)
  })

  it.each([
    ['an invalid date', { date: '2026-13-45' }],
    ['an invalid time', { time: '25:99' }],
    ['an unknown priority', { priority: 'urgent' }],
    ['an unknown tag', { tag: 'ocio' }],
    ['a non-boolean completed', { completed: 'yes' }],
    ['an empty id', { id: '' }],
  ])('rejects a task with %s', (_name, override) => {
    const task = { ...makeTask(), ...override }
    expect(parseBackup(JSON.stringify({ ...createBackup([], [], NOW), tasks: [task] })).ok).toBe(
      false,
    )
  })

  it('rejects a reminder with an unknown repeat', () => {
    const reminder = { ...makeReminder(), repeat: 'weekly' }
    const text = JSON.stringify({ ...createBackup([], [], NOW), reminders: [reminder] })
    expect(parseBackup(text).ok).toBe(false)
  })

  it('rejects duplicated ids', () => {
    const task = makeTask()
    const text = JSON.stringify(createBackup([task, task], [], NOW))
    expect(parseBackup(text)).toMatchObject({
      ok: false,
      error: 'La copia contiene elementos repetidos.',
    })
  })
})
