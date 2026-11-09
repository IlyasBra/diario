import { useMemo } from 'react'

import { useUndo } from '@/features/undo/useUndo'
import { addDaysToISODate, type ISODate } from '@/lib/dates'

import { type TaskItemActions } from '../components/TaskItem'
import { isRecurring, toggleDoneDate } from '../recurrence'
import { type Task } from '../types'
import { useTasks } from './useTasks'

/**
 * Wires the buttons of a TaskItem to the task store.
 *
 * Items may be "projected" occurrences of a repeating task (their `date` is
 * the day shown), so changes are always applied to the stored task.
 */
export function useTaskItemActions(today: ISODate, onEdit: (task: Task) => void): TaskItemActions {
  const { tasks, updateTask } = useTasks()
  const { showUndo } = useUndo()

  return useMemo(() => {
    const stored = (task: Task) => tasks.find((candidate) => candidate.id === task.id) ?? task

    return {
      onToggle: (task) => {
        const original = stored(task)
        if (isRecurring(original)) {
          const completing = !original.doneDates.includes(task.date)
          void updateTask(original.id, { doneDates: toggleDoneDate(original.doneDates, task.date) })
          if (completing) {
            showUndo('Tarea completada', () => {
              void updateTask(original.id, { doneDates: original.doneDates })
            })
          }
        } else {
          void updateTask(original.id, { completed: !original.completed })
          if (!original.completed) {
            showUndo('Tarea completada', () => {
              void updateTask(original.id, { completed: false })
            })
          }
        }
      },
      onToggleSubtask: (task, subtaskId) => {
        const original = stored(task)
        void updateTask(original.id, {
          subtasks: original.subtasks.map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask,
          ),
        })
      },
      onPostpone: (task) => void updateTask(task.id, { date: addDaysToISODate(today, 1) }),
      onEdit: (task) => {
        onEdit(stored(task))
      },
    }
  }, [tasks, today, onEdit, updateTask, showUndo])
}
