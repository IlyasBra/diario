import { InMemoryTagRepository } from '@/features/tags/data/inMemoryTagRepository'
import { type TagRepository } from '@/features/tags/data/tagRepository'
import { buildDefaultTags } from '@/features/tags/defaults'
import { tagModel } from '@/features/tags/model'
import { InMemoryReminderRepository } from '@/features/reminders/data/inMemoryReminderRepository'
import { type ReminderRepository } from '@/features/reminders/data/reminderRepository'
import { reminderModel } from '@/features/reminders/model'
import { InMemoryTaskRepository } from '@/features/tasks/data/inMemoryTaskRepository'
import { type TaskRepository } from '@/features/tasks/data/taskRepository'
import { taskModel } from '@/features/tasks/model'

import { DiarioDatabase } from './database'
import { DexieRepository } from './dexieRepository'
import { ensureDefaultTags } from './ensureDefaultTags'

export interface Repositories {
  tasks: TaskRepository
  reminders: ReminderRepository
  tags: TagRepository
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
    await ensureDefaultTags(db)
    return {
      tasks: new DexieRepository(db.tasks, taskModel),
      reminders: new DexieRepository(db.reminders, reminderModel),
      tags: new DexieRepository(db.tags, tagModel),
      isPersistent: true,
    }
  } catch (error) {
    console.warn('IndexedDB is not available, falling back to memory storage.', error)
    return {
      tasks: new InMemoryTaskRepository(),
      reminders: new InMemoryReminderRepository(),
      tags: new InMemoryTagRepository(buildDefaultTags(new Date())),
      isPersistent: false,
    }
  }
}
