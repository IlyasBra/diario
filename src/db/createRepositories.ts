import { InMemoryTaskRepository } from '@/features/tasks/data/inMemoryTaskRepository'
import { type TaskRepository } from '@/features/tasks/data/taskRepository'

import { DiarioDatabase } from './database'
import { DexieTaskRepository } from './dexieTaskRepository'

export interface Repositories {
  tasks: TaskRepository
  /** False when data only lives in memory and is lost on reload. */
  isPersistent: boolean
}

/**
 * Single place where concrete implementations are chosen. Swapping
 * IndexedDB for a backend later means changing this function only.
 */
export async function createRepositories(): Promise<Repositories> {
  try {
    const db = new DiarioDatabase()
    await db.open()
    return { tasks: new DexieTaskRepository(db), isPersistent: true }
  } catch (error) {
    console.warn('IndexedDB is not available, falling back to memory storage.', error)
    return { tasks: new InMemoryTaskRepository(), isPersistent: false }
  }
}
