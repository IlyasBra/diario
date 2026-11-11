import { type ReactNode, useMemo } from 'react'

import { type StoreErrorMessages, useRepositoryStore } from '@/hooks/useRepositoryStore'
import { useI18n } from '@/i18n'

import { type TaskRepository } from '../data/taskRepository'
import { taskModel } from '../model'
import { TasksContext, type TasksContextValue } from './TasksContext'

interface TasksProviderProps {
  /** Injected so tests (or a future backend) can provide their own. */
  repository: TaskRepository
  children: ReactNode
}

/** Makes the task list and its actions available through useTasks(). */
export function TasksProvider({ repository, children }: TasksProviderProps) {
  const { t } = useI18n()
  const messages = useMemo<StoreErrorMessages>(
    () => ({
      create: t('store.task.create'),
      update: t('store.task.update'),
      remove: t('store.task.remove'),
      replace: t('store.task.replace'),
    }),
    [t],
  )
  const store = useRepositoryStore(repository, taskModel, messages)

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
