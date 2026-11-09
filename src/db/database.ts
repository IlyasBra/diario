import { Dexie, type Table } from 'dexie'

import { type Reminder } from '@/features/reminders/types'
import { type Tag } from '@/features/tags/types'
import { type Task } from '@/features/tasks/types'

export const DATABASE_NAME = 'diario'

/**
 * IndexedDB schema. Only indexed fields are listed in `stores`; the rest of
 * each object is stored as-is. Booleans cannot be indexed in IndexedDB, so
 * "completed" is filtered in memory.
 *
 * Never edit an existing version: add a new one with an upgrade function,
 * so users who already have data are migrated on their next visit.
 */
export class DiarioDatabase extends Dexie {
  declare tasks: Table<Task, string>
  declare reminders: Table<Reminder, string>
  declare tags: Table<Tag, string>

  constructor(name: string = DATABASE_NAME) {
    super(name)

    this.version(1).stores({
      tasks: 'id, date, updatedAt',
    })

    // v2: tasks get an optional time of day.
    this.version(2)
      .stores({
        tasks: 'id, date, updatedAt',
      })
      .upgrade((tx) =>
        tx
          .table<Partial<Task>>('tasks')
          .toCollection()
          .modify((task) => {
            task.time ??= null
          }),
      )

    // v3: reminders with a date, a time and an optional repeat.
    this.version(3).stores({
      tasks: 'id, date, updatedAt',
      reminders: 'id, date',
    })

    // v4: user-defined tags. Defaults are created on open (ensureDefaultTags).
    this.version(4).stores({
      tasks: 'id, date, updatedAt',
      reminders: 'id, date',
      tags: 'id',
    })
  }
}
