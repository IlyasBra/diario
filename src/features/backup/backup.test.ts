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
