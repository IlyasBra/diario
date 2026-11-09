import { addDaysToISODate, type ISODate } from '@/lib/dates'

import { isRecurring, occurrenceDates, occursOn, projectOccurrence } from './recurrence'
import { type Priority, type Task } from './types'

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

/** How far ahead repeating tasks are listed in "Próximos días". */
export const UPCOMING_HORIZON_DAYS = 14

/**
 * A one-off task is overdue when it is still pending and its day has passed.
 * Missed days of a repeating task are not "overdue": the series just goes on.
 */
export function isOverdue(task: Task, today: ISODate): boolean {
  return !isRecurring(task) && !task.completed && task.date < today
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

/** Tasks planned on one day, repeating ones projected onto that day. Unsorted. */
export function selectTasksOnDay(tasks: readonly Task[], date: ISODate): Task[] {
  return tasks.filter((task) => occursOn(task, date)).map((task) => projectOccurrence(task, date))
}

/** Tasks per day in [from, to], repeating ones expanded. Days without tasks are absent. */
export function selectTasksByDay(
  tasks: readonly Task[],
  from: ISODate,
  to: ISODate,
): Map<ISODate, Task[]> {
  const byDay = new Map<ISODate, Task[]>()
  for (const task of tasks) {
    for (const date of occurrenceDates(task, from, to)) {
      const list = byDay.get(date)
      const projected = projectOccurrence(task, date)
      if (list) list.push(projected)
      else byDay.set(date, [projected])
    }
  }
  return byDay
}

export interface TodayTasks {
  /** Pending one-off tasks from previous days, oldest day first. */
  overdue: Task[]
  /** Every task planned for today, pending ones first. */
  today: Task[]
}

export function selectTodayTasks(tasks: readonly Task[], today: ISODate): TodayTasks {
  const overdue = tasks
    .filter((task) => isOverdue(task, today))
    .sort((a, b) => a.date.localeCompare(b.date) || compareTasks(a, b))
  const todayTasks = selectTasksOnDay(tasks, today).sort(compareTasks)
  return { overdue, today: todayTasks }
}

export interface TaskGroup {
  date: ISODate
  tasks: Task[]
}

/**
 * Tasks after today grouped by day, in chronological order. Repeating
 * tasks are listed for the next `UPCOMING_HORIZON_DAYS` days only.
 */
export function selectUpcomingGroups(tasks: readonly Task[], today: ISODate): TaskGroup[] {
  const byDate = new Map<ISODate, Task[]>()
  const add = (task: Task) => {
    const group = byDate.get(task.date)
    if (group) group.push(task)
    else byDate.set(task.date, [task])
  }

  const horizon = addDaysToISODate(today, UPCOMING_HORIZON_DAYS)
  const tomorrow = addDaysToISODate(today, 1)
  for (const task of tasks) {
    if (isRecurring(task)) {
      for (const date of occurrenceDates(task, tomorrow, horizon))
        add(projectOccurrence(task, date))
    } else if (task.date > today) {
      add(task)
    }
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
