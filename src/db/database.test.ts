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
