import { type ISODate, type TimeString } from '@/lib/dates'

export const PRIORITIES = ['high', 'medium', 'low'] as const
export type Priority = (typeof PRIORITIES)[number]

export interface Task {
  id: string
  title: string
  /** Empty string when the task has no note. */
  note: string
  /** Day the task is planned for. */
  date: ISODate
  /** Optional time of day, e.g. an appointment at "10:30". */
  time: TimeString | null
  priority: Priority
  /** Id of a user tag (see features/tags). */
  tag: string
  completed: boolean
  /** ISO timestamp, null while the task is pending. */
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Fields the user fills in the form. */
export type TaskInput = Pick<Task, 'title' | 'note' | 'date' | 'time' | 'priority' | 'tag'>

/** Fields that can change after creation. */
export type TaskChanges = Partial<TaskInput & Pick<Task, 'completed'>>
