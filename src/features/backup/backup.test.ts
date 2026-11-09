import { describe, expect, it } from 'vitest'

import { buildDefaultTags } from '@/features/tags/defaults'
import { makeReminder, makeTask } from '@/test/factories'

import { backupFileName, createBackup, parseBackup } from './backup'

const NOW = new Date('2026-11-09T21:30:00.000Z')
const TAGS = buildDefaultTags(NOW)

describe('backup', () => {
  it('round-trips tasks and reminders through JSON', () => {
    const tasks = [
      makeTask({ time: '10:30' }),
      makeTask({ completed: true, completedAt: NOW.toISOString() }),
    ]
    const reminders = [makeReminder({ repeat: 'monthly' })]

    const result = parseBackup(JSON.stringify(createBackup(tasks, reminders, TAGS, NOW)))

    expect(result).toMatchObject({ ok: true, backup: { tasks, reminders, tags: TAGS } })
  })

  it('names the file after the export date', () => {
    expect(backupFileName(NOW)).toBe('diario-copia-2026-11-09.json')
  })

  it.each([
    ['not JSON', 'esto no es json'],
    ['another app', JSON.stringify({ app: 'otra', version: 1, tasks: [], reminders: [] })],
    ['a newer version', JSON.stringify({ ...createBackup([], [], TAGS, NOW), version: 99 })],
    ['missing lists', JSON.stringify({ app: 'diario', version: 1, exportedAt: NOW.toISOString() })],
    ['an array', '[]'],
  ])('rejects %s', (_name, text) => {
    expect(parseBackup(text).ok).toBe(false)
  })

  it.each([
    ['an invalid date', { date: '2026-13-45' }],
    ['an invalid time', { time: '25:99' }],
    ['an unknown priority', { priority: 'urgent' }],
    ['an empty tag', { tag: '' }],
    ['a non-boolean completed', { completed: 'yes' }],
    ['an empty id', { id: '' }],
  ])('rejects a task with %s', (_name, override) => {
    const task = { ...makeTask(), ...override }
    expect(
      parseBackup(JSON.stringify({ ...createBackup([], [], TAGS, NOW), tasks: [task] })).ok,
    ).toBe(false)
  })

  it('rejects a reminder with an unknown repeat', () => {
    const reminder = { ...makeReminder(), repeat: 'weekly' }
    const text = JSON.stringify({ ...createBackup([], [], TAGS, NOW), reminders: [reminder] })
    expect(parseBackup(text).ok).toBe(false)
  })

  it('rejects duplicated ids', () => {
    const task = makeTask()
    const text = JSON.stringify(createBackup([task, task], [], TAGS, NOW))
    expect(parseBackup(text)).toMatchObject({
      ok: false,
      error: 'La copia contiene elementos repetidos.',
    })
  })

  it('rejects tasks whose tag is not in the backup', () => {
    const task = makeTask({ tag: 'gimnasio' })
    const text = JSON.stringify(createBackup([task], [], TAGS, NOW))
    expect(parseBackup(text)).toMatchObject({
      ok: false,
      error: 'La copia contiene tareas con etiquetas desconocidas.',
    })
  })

  it('accepts version 1 backups (no tags) using the default tags', () => {
    const task = makeTask({ tag: 'work' })
    const legacy = {
      app: 'diario',
      version: 1,
      exportedAt: NOW.toISOString(),
      tasks: [task],
      reminders: [],
    }

    const result = parseBackup(JSON.stringify(legacy))

    expect(result).toMatchObject({ ok: true, backup: { tasks: [task] } })
    expect(result.ok && result.backup.tags.map((tag) => tag.id)).toEqual([
      'home',
      'studies',
      'work',
      'personal',
      'other',
    ])
  })

  it('rejects invalid tags', () => {
    const bad = { ...TAGS[0], color: 'neon' }
    const text = JSON.stringify({ ...createBackup([], [], TAGS, NOW), tags: [bad] })
    expect(parseBackup(text).ok).toBe(false)
  })
})

describe('backup of repeating tasks and checklists', () => {
  it('round-trips repeat, doneDates and subtasks', () => {
    const repeating = makeTask({
      repeat: { kind: 'weekly', days: [0, 3] },
      doneDates: ['2026-11-09'],
    })
    const checklist = makeTask({
      subtasks: [
        { id: 's1', title: 'Leche', done: true },
        { id: 's2', title: 'Pan', done: false },
      ],
    })

    const result = parseBackup(JSON.stringify(createBackup([repeating, checklist], [], TAGS, NOW)))

    expect(result).toMatchObject({ ok: true, backup: { tasks: [repeating, checklist] } })
  })

  it('fills defaults for tasks from older backups', () => {
    // A task as stored before repeat, doneDates and subtasks existed.
    const legacyTask = Object.fromEntries(
      Object.entries(makeTask({ title: 'Antigua' })).filter(
        ([key]) => !['repeat', 'doneDates', 'subtasks'].includes(key),
      ),
    )
    const text = JSON.stringify({
      ...createBackup([], [], TAGS, NOW),
      version: 2,
      tasks: [legacyTask],
    })

    expect(parseBackup(text)).toMatchObject({
      ok: true,
      backup: {
        tasks: [{ title: 'Antigua', repeat: { kind: 'none' }, doneDates: [], subtasks: [] }],
      },
    })
  })

  it.each([
    ['an unknown repeat kind', { repeat: { kind: 'yearly' } }],
    ['a weekly repeat without days', { repeat: { kind: 'weekly', days: [] } }],
    ['a weekday out of range', { repeat: { kind: 'weekly', days: [7] } }],
    ['invalid done dates', { doneDates: ['mañana'] }],
    ['an invalid subtask', { subtasks: [{ id: 'x', title: 3, done: false }] }],
  ])('rejects a task with %s', (_name, override) => {
    const task = { ...makeTask(), ...override }
    expect(
      parseBackup(JSON.stringify({ ...createBackup([], [], TAGS, NOW), tasks: [task] })).ok,
    ).toBe(false)
  })
})
