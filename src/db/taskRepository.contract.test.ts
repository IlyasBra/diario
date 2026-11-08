import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { InMemoryTaskRepository } from '@/features/tasks/data/inMemoryTaskRepository'
import { type TaskRepository } from '@/features/tasks/data/taskRepository'
import { taskModel } from '@/features/tasks/model'
import { type TaskInput } from '@/features/tasks/types'
import { EntityNotFoundError } from '@/lib/data/repository'

import { DiarioDatabase } from './database'
import { DexieRepository } from './dexieRepository'

const input: TaskInput = {
  title: 'Llamar al dentista',
  note: 'Pedir cita para revisión',
  date: '2026-11-10',
  priority: 'high',
  tag: 'personal',
}

/**
 * Contract tests: every TaskRepository implementation must pass the same
 * suite, so they are interchangeable.
 */
const implementations: [string, () => { repo: TaskRepository; cleanup: () => Promise<void> }][] = [
  [
    'DexieRepository<Task>',
    () => {
      const db = new DiarioDatabase(`test-${crypto.randomUUID()}`)
      return { repo: new DexieRepository(db.tasks, taskModel), cleanup: () => db.delete() }
    },
  ],
  [
    'InMemoryTaskRepository',
    () => ({ repo: new InMemoryTaskRepository(), cleanup: () => Promise.resolve() }),
  ],
]

describe.each(implementations)('%s', (_name, setup) => {
  let repo: TaskRepository
  let cleanup: () => Promise<void>

  beforeEach(() => {
    ;({ repo, cleanup } = setup())
  })

  afterEach(async () => {
    await cleanup()
  })

  it('starts empty', async () => {
    expect(await repo.list()).toEqual([])
  })

  it('creates and lists tasks', async () => {
    const created = await repo.create(input)

    expect(created.id).toEqual(expect.any(String))
    expect(created).toMatchObject({ ...input, completed: false })
    expect(await repo.list()).toEqual([created])
  })

  it('updates a task and persists the change', async () => {
    const created = await repo.create(input)
    const updated = await repo.update(created.id, { completed: true, date: '2026-11-11' })

    expect(updated.completed).toBe(true)
    expect(updated.completedAt).not.toBeNull()
    expect(await repo.list()).toEqual([updated])
  })

  it('rejects updates to a missing task', async () => {
    await expect(repo.update('missing', { title: 'x' })).rejects.toBeInstanceOf(EntityNotFoundError)
  })

  it('removes a task', async () => {
    const keep = await repo.create(input)
    const drop = await repo.create({ ...input, title: 'Borrar' })

    await repo.remove(drop.id)

    expect(await repo.list()).toEqual([keep])
  })
})
