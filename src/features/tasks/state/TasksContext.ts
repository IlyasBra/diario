import { createContext } from 'react'

import { type Task, type TaskChanges, type TaskInput } from '../types'

export type TasksStatus = 'loading' | 'ready' | 'error'

export interface TasksContextValue {
  tasks: Task[]
  status: TasksStatus
  /** Last failed action, shown to the user. */
  error: string | null
  dismissError: () => void
  /** Each action resolves to true on success, so forms know when to close. */
  createTask: (input: TaskInput) => Promise<boolean>
  updateTask: (id: string, changes: TaskChanges) => Promise<boolean>
  deleteTask: (id: string) => Promise<boolean>
}

export const TasksContext = createContext<TasksContextValue | null>(null)
