import { Dexie } from 'dexie'
import { describe, expect, it } from 'vitest'

import { DiarioDatabase } from './database'

describe('DiarioDatabase migrations', () => {
  it('upgrades v1 tasks by adding time: null', async () => {
    const name = `migration-${crypto.randomUUID()}`

    // Simulate a user who still has the v1 database from phase 2.
    const legacy = new Dexie(name)
    legacy.version(1).stores({ tasks: 'id, date, updatedAt' })
    await legacy.table('tasks').add({ id: 'old', title: 'Tarea antigua', date: '2026-11-08' })
    legacy.close()

    const db = new DiarioDatabase(name)
    const task = await db.tasks.get('old')

    expect(task).toMatchObject({ id: 'old', title: 'Tarea antigua', time: null })
    await db.delete()
  })
})

describe('migration to v5 (repeating tasks and checklists)', () => {
  it('gives existing tasks the default repeat, doneDates and subtasks', async () => {
    const name = `test-${crypto.randomUUID()}`
    const old = new Dexie(name)
    old.version(1).stores({ tasks: 'id, date, updatedAt' })
    old.version(2).stores({ tasks: 'id, date, updatedAt' })
    old.version(3).stores({ tasks: 'id, date, updatedAt', reminders: 'id, date' })
    await old.table('tasks').add({ id: 't1', title: 'Vieja', date: '2026-11-01', time: null })
    old.close()

    const db = new DiarioDatabase(name)
    const task = await db.tasks.get('t1')

    expect(task).toMatchObject({
      title: 'Vieja',
      repeat: { kind: 'none' },
      doneDates: [],
      subtasks: [],
    })
    await db.delete()
  })
})
