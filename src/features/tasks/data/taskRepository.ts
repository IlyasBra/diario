import { type Task, type TaskChanges, type TaskInput } from '../types'

/**
 * Data access contract for tasks.
 *
 * The UI only talks to this interface. Today it is backed by IndexedDB
 * (Dexie); a future backend only needs another implementation, e.g. an
 * HttpTaskRepository, without touching any component.
 */
export interface TaskRepository {
  list(): Promise<Task[]>
  create(input: TaskInput): Promise<Task>
  update(id: string, changes: TaskChanges): Promise<Task>
  remove(id: string): Promise<void>
}

export class TaskNotFoundError extends Error {
  constructor(id: string) {
    super(`Task "${id}" not found`)
    this.name = 'TaskNotFoundError'
  }
}
