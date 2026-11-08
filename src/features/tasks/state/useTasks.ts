import { use } from 'react'

import { TasksContext, type TasksContextValue } from './TasksContext'

export function useTasks(): TasksContextValue {
  const context = use(TasksContext)
  if (!context) throw new Error('useTasks must be used inside <TasksProvider>')
  return context
}
