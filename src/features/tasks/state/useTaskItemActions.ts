import { useMemo } from 'react'

import { addDaysToISODate, type ISODate } from '@/lib/dates'

import { type TaskItemActions } from '../components/TaskItem'
import { type Task } from '../types'
import { useTasks } from './useTasks'

/** Wires the buttons of a TaskItem to the task store. */
export function useTaskItemActions(today: ISODate, onEdit: (task: Task) => void): TaskItemActions {
  const { updateTask } = useTasks()

  return useMemo(
    () => ({
      onToggle: (task) => void updateTask(task.id, { completed: !task.completed }),
      onPostpone: (task) => void updateTask(task.id, { date: addDaysToISODate(today, 1) }),
      onEdit,
    }),
    [today, onEdit, updateTask],
  )
}
