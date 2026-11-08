import { Dexie, type EntityTable } from 'dexie'

import { type Task } from '@/features/tasks/types'

export const DATABASE_NAME = 'diario'

/**
 * IndexedDB schema. Only indexed fields are listed in `stores`; the rest of
 * each object is stored as-is. Booleans cannot be indexed in IndexedDB, so
 * "completed" is filtered in memory.
 *
 * To change the schema, add a new `this.version(n)` with an upgrade
 * function instead of editing an existing version.
 */
export class DiarioDatabase extends Dexie {
  declare tasks: EntityTable<Task, 'id'>

  constructor(name: string = DATABASE_NAME) {
    super(name)
    this.version(1).stores({
      tasks: 'id, date, updatedAt',
    })
  }
}
