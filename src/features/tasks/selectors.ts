import { type ISODate } from '@/lib/dates'

import { type Priority, type Task } from './types'

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

/** A task is overdue when it is still pending and its day has passed. */
export function isOverdue(task: Task, today: ISODate): boolean {
  return !task.completed && task.date < today
}

/**
 * Pending first; then tasks with a time, earliest first; then by priority;
 * then oldest first.
 */
export function compareTasks(a: Task, b: Task): number {
  if (a.completed !== b.completed) return a.completed ? 1 : -1
  if (a.time !== b.time) {
    if (a.time === null) return 1
    if (b.time === null) return -1
    return a.time.localeCompare(b.time)
  }
  const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  if (byPriority !== 0) return byPriority
  return a.createdAt.localeCompare(b.createdAt)
}

export interface TodayTasks {
  /** Pending tasks from previous days, oldest day first. */
  overdue: Task[]
  /** Every task planned for today, pending ones first. */
  today: Task[]
}

export function selectTodayTasks(tasks: readonly Task[], today: ISODate): TodayTasks {
  const overdue = tasks
    .filter((task) => isOverdue(task, today))
    .sort((a, b) => a.date.localeCompare(b.date) || compareTasks(a, b))
  const todayTasks = tasks.filter((task) => task.date === today).sort(compareTasks)
  return { overdue, today: todayTasks }
}

export interface TaskGroup {
  date: ISODate
  tasks: Task[]
}

/** Tasks after today grouped by day, in chronological order. */
export function selectUpcomingGroups(tasks: readonly Task[], today: ISODate): TaskGroup[] {
  const byDate = new Map<ISODate, Task[]>()

  for (const task of tasks) {
    if (task.date <= today) continue
    const group = byDate.get(task.date)
    if (group) group.push(task)
    else byDate.set(task.date, [task])
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, groupTasks]) => ({ date, tasks: groupTasks.sort(compareTasks) }))
}

export interface DaySummary {
  total: number
  completed: number
  overdue: number
}

export function summarizeDay(tasks: readonly Task[], today: ISODate): DaySummary {
  const { overdue, today: todayTasks } = selectTodayTasks(tasks, today)
  return {
    total: todayTasks.length,
    completed: todayTasks.filter((task) => task.completed).length,
    overdue: overdue.length,
  }
}
