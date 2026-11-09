import { type ReactNode, useMemo } from 'react'

import { type StoreErrorMessages, useRepositoryStore } from '@/hooks/useRepositoryStore'

import { type TaskRepository } from '../data/taskRepository'
import { taskModel } from '../model'
import { TasksContext, type TasksContextValue } from './TasksContext'

const ERROR_MESSAGES: StoreErrorMessages = {
  create: 'No se ha podido crear la tarea.',
  update: 'No se ha podido guardar la tarea.',
  remove: 'No se ha podido borrar la tarea.',
  replace: 'No se han podido restaurar las tareas.',
}

interface TasksProviderProps {
  /** Injected so tests (or a future backend) can provide their own. */
  repository: TaskRepository
  children: ReactNode
}

/** Makes the task list and its actions available through useTasks(). */
export function TasksProvider({ repository, children }: TasksProviderProps) {
  const store = useRepositoryStore(repository, taskModel, ERROR_MESSAGES)

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks: store.items,
      status: store.status,
      error: store.error,
      dismissError: store.dismissError,
      createTask: store.create,
      updateTask: store.update,
      deleteTask: store.remove,
      replaceTasks: store.replaceAll,
      restoreTask: store.restore,
    }),
    [store],
  )

  return <TasksContext value={value}>{children}</TasksContext>
}
