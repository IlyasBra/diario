import { type ISODate, type TimeString } from '@/lib/dates'

export const PRIORITIES = ['high', 'medium', 'low'] as const
export type Priority = (typeof PRIORITIES)[number]

/** 0 = Monday … 6 = Sunday (week starts on Monday, as in Spain). */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * How a task repeats. "monthly" repeats on the day of the month of the
 * start date (the 31st falls on the last day of shorter months).
 */
export type TaskRepeat =
  | { kind: 'none' }
  | { kind: 'daily' }
  | { kind: 'weekly'; days: WeekdayIndex[] }
  | { kind: 'monthly' }

/** One item of a task's checklist. */
export interface Subtask {
  id: string
  title: string
  done: boolean
}

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
  /** Only for one-off tasks; a repeating task is completed per day (doneDates). */
  completed: boolean
  /** ISO timestamp, null while the task is pending. */
  completedAt: string | null
  /** Rule to repeat the task. `date` is then the first day of the series. */
  repeat: TaskRepeat
  /** Days of a repeating task that were completed. */
  doneDates: ISODate[]
  /** Checklist (only for one-off tasks). */
  subtasks: Subtask[]
  createdAt: string
  updatedAt: string
}

/** Fields the user fills in the form. */
export type TaskInput = Pick<
  Task,
  'title' | 'note' | 'date' | 'time' | 'priority' | 'tag' | 'repeat' | 'subtasks'
>

/** Fields that can change after creation. */
export type TaskChanges = Partial<TaskInput & Pick<Task, 'completed' | 'doneDates'>>
