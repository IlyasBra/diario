import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { type TaskRepository } from '../data/taskRepository'
import { applyTaskChanges } from '../model'
import { type Task, type TaskChanges, type TaskInput } from '../types'
import { TasksContext, type TasksContextValue, type TasksStatus } from './TasksContext'

interface TasksProviderProps {
  /** Injected so tests (or a future backend) can provide their own. */
  repository: TaskRepository
  children: ReactNode
}

/**
 * Holds the task list in React state and keeps it in sync with the
 * repository. Components read tasks and call actions through useTasks().
 */
export function TasksProvider({ repository, children }: TasksProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [status, setStatus] = useState<TasksStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  // Latest tasks for the action callbacks, without re-creating them (and
  // re-rendering every consumer) on each change.
  const tasksRef = useRef(tasks)
  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  useEffect(() => {
    let cancelled = false
    repository.list().then(
      (list) => {
        if (cancelled) return
        setTasks(list)
        setStatus('ready')
      },
      (reason: unknown) => {
        console.error(reason)
        if (!cancelled) setStatus('error')
      },
    )
    return () => {
      cancelled = true
    }
  }, [repository])

  /** Runs a repository call and turns failures into a user-facing message. */
  const attempt = useCallback(
    async <T,>(action: () => Promise<T>, message: string): Promise<T | undefined> => {
      try {
        setError(null)
        return await action()
      } catch (reason) {
        console.error(reason)
        setError(message)
        return undefined
      }
    },
    [],
  )

  const createTask = useCallback(
    async (input: TaskInput) => {
      const task = await attempt(() => repository.create(input), 'No se ha podido crear la tarea.')
      if (task) setTasks((current) => [...current, task])
      return task !== undefined
    },
    [attempt, repository],
  )

  // Updates and deletes are optimistic: the UI changes immediately (a
  // checkbox must react on tap) and is rolled back if saving fails.
  const updateTask = useCallback(
    async (id: string, changes: TaskChanges) => {
      const previous = tasksRef.current.find((item) => item.id === id)
      if (!previous) return false

      const replace = (task: Task) => {
        setTasks((current) => current.map((item) => (item.id === id ? task : item)))
      }
      replace(applyTaskChanges(previous, changes, new Date()))

      const saved = await attempt(
        () => repository.update(id, changes),
        'No se ha podido guardar la tarea.',
      )
      replace(saved ?? previous)
      return saved !== undefined
    },
    [attempt, repository],
  )

  const deleteTask = useCallback(
    async (id: string) => {
      const index = tasksRef.current.findIndex((item) => item.id === id)
      const previous = tasksRef.current[index]
      if (!previous) return false

      setTasks((current) => current.filter((item) => item.id !== id))

      const done = await attempt(async () => {
        await repository.remove(id)
        return true
      }, 'No se ha podido borrar la tarea.')
      if (!done) setTasks((current) => current.toSpliced(index, 0, previous))
      return done === true
    },
    [attempt, repository],
  )

  const dismissError = useCallback(() => {
    setError(null)
  }, [])

  const value = useMemo<TasksContextValue>(
    () => ({ tasks, status, error, dismissError, createTask, updateTask, deleteTask }),
    [tasks, status, error, dismissError, createTask, updateTask, deleteTask],
  )

  return <TasksContext value={value}>{children}</TasksContext>
}
