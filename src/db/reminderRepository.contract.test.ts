import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { InMemoryReminderRepository } from '@/features/reminders/data/inMemoryReminderRepository'
import { type ReminderRepository } from '@/features/reminders/data/reminderRepository'
import { reminderModel } from '@/features/reminders/model'
import { type ReminderInput } from '@/features/reminders/types'

import { DiarioDatabase } from './database'
import { DexieRepository } from './dexieRepository'

const input: ReminderInput = {
  title: 'Cumpleaños de Sara',
  note: '',
  date: '1998-04-12',
  time: '09:00',
  repeat: 'yearly',
}

const implementations: [
  string,
  () => { repo: ReminderRepository; cleanup: () => Promise<void> },
][] = [
  [
    'DexieRepository<Reminder>',
    () => {
      const db = new DiarioDatabase(`test-${crypto.randomUUID()}`)
      return { repo: new DexieRepository(db.reminders, reminderModel), cleanup: () => db.delete() }
    },
  ],
  [
    'InMemoryReminderRepository',
    () => ({ repo: new InMemoryReminderRepository(), cleanup: () => Promise.resolve() }),
  ],
]

describe.each(implementations)('%s', (_name, setup) => {
  let repo: ReminderRepository
  let cleanup: () => Promise<void>

  beforeEach(() => {
    ;({ repo, cleanup } = setup())
  })

  afterEach(async () => {
    await cleanup()
  })

  it('creates, updates and removes reminders', async () => {
    const created = await repo.create({ ...input, title: '  Cumpleaños de Sara ' })
    expect(created).toMatchObject(input)

    const updated = await repo.update(created.id, { time: '08:30', repeat: 'none' })
    expect(updated).toMatchObject({ time: '08:30', repeat: 'none' })
    expect(await repo.list()).toEqual([updated])

    await repo.remove(created.id)
    expect(await repo.list()).toEqual([])
  })
})
