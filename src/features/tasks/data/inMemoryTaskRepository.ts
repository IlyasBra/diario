import { InMemoryRepository } from '@/lib/data/inMemoryRepository'

import { taskModel } from '../model'
import { type Task, type TaskChanges, type TaskInput } from '../types'

export class InMemoryTaskRepository extends InMemoryRepository<Task, TaskInput, TaskChanges> {
  constructor(initialTasks: readonly Task[] = []) {
    super(taskModel, initialTasks)
  }
}
