import { createId } from '@/lib/id'

import { applyTaskChanges, buildTask } from '../model'
import { type Task, type TaskChanges, type TaskInput } from '../types'
import { TaskNotFoundError, type TaskRepository } from './taskRepository'

/**
 * Keeps tasks in memory only. Used when the browser blocks IndexedDB
 * (some private modes and sandboxed frames) and in tests.
 */
export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<string, Task>()

  constructor(initialTasks: readonly Task[] = []) {
    for (const task of initialTasks) this.tasks.set(task.id, task)
  }

  list(): Promise<Task[]> {
    return Promise.resolve([...this.tasks.values()])
  }

  create(input: TaskInput): Promise<Task> {
    const task = buildTask(input, createId(), new Date())
    this.tasks.set(task.id, task)
    return Promise.resolve(task)
  }

  update(id: string, changes: TaskChanges): Promise<Task> {
    const current = this.tasks.get(id)
    if (!current) return Promise.reject(new TaskNotFoundError(id))
    const next = applyTaskChanges(current, changes, new Date())
    this.tasks.set(id, next)
    return Promise.resolve(next)
  }

  remove(id: string): Promise<void> {
    this.tasks.delete(id)
    return Promise.resolve()
  }
}
