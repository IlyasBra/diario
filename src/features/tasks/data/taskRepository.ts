import { type Repository } from '@/lib/data/repository'

import { type Task, type TaskChanges, type TaskInput } from '../types'

/** Data access for tasks. See Repository for the contract. */
export type TaskRepository = Repository<Task, TaskInput, TaskChanges>
