import { TaskNotFoundError, type TaskRepository } from '@/features/tasks/data/taskRepository'
import { applyTaskChanges, buildTask } from '@/features/tasks/model'
import { type Task, type TaskChanges, type TaskInput } from '@/features/tasks/types'
import { createId } from '@/lib/id'

import { type DiarioDatabase } from './database'

/** TaskRepository backed by IndexedDB through Dexie. */
export class DexieTaskRepository implements TaskRepository {
  private readonly db: DiarioDatabase

  constructor(db: DiarioDatabase) {
    this.db = db
  }

  list(): Promise<Task[]> {
    return this.db.tasks.toArray()
  }

  async create(input: TaskInput): Promise<Task> {
    const task = buildTask(input, createId(), new Date())
    await this.db.tasks.add(task)
    return task
  }

  update(id: string, changes: TaskChanges): Promise<Task> {
    // Read and write in one transaction so concurrent updates cannot interleave.
    return this.db.transaction('rw', this.db.tasks, async () => {
      const current = await this.db.tasks.get(id)
      if (!current) throw new TaskNotFoundError(id)
      const next = applyTaskChanges(current, changes, new Date())
      await this.db.tasks.put(next)
      return next
    })
  }

  async remove(id: string): Promise<void> {
    await this.db.tasks.delete(id)
  }
}
