import { type ISODate } from '@/lib/dates'

import { isRecurring } from './recurrence'
import { type Task } from './types'

export interface TaskMove {
  taskId: string
  from: ISODate
  to: ISODate
}

/**
 * What dropping a task on a day does. Returns null when nothing should
 * change: dropped outside the day targets, on its own day, or a repeating
 * task (it belongs to many days, so it has no single day to move).
 */
export function resolveTaskMove(
  tasks: readonly Task[],
  taskId: string,
  targetDate: string | null,
): TaskMove | null {
  const task = tasks.find((candidate) => candidate.id === taskId)
  if (!task || targetDate === null || isRecurring(task) || task.date === targetDate) return null
  return { taskId, from: task.date, to: targetDate }
}
