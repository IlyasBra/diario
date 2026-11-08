import { type ISODate } from '@/lib/dates'

export const PRIORITIES = ['high', 'medium', 'low'] as const
export type Priority = (typeof PRIORITIES)[number]

export const TAGS = ['home', 'studies', 'work', 'personal', 'other'] as const
export type Tag = (typeof TAGS)[number]

export interface Task {
  id: string
  title: string
  /** Empty string when the task has no note. */
  note: string
  /** Day the task is planned for. */
  date: ISODate
  priority: Priority
  tag: Tag
  completed: boolean
  /** ISO timestamp, null while the task is pending. */
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Fields the user fills in the form. */
export type TaskInput = Pick<Task, 'title' | 'note' | 'date' | 'priority' | 'tag'>

/** Fields that can change after creation. */
export type TaskChanges = Partial<TaskInput & Pick<Task, 'completed'>>
