import { type Reminder } from '@/features/reminders/types'
import { tagDisplayName } from '@/features/tags/names'
import { type Tag } from '@/features/tags/types'
import { type Priority, type Task } from '@/features/tasks/types'
import { matchesQuery } from '@/lib/text'

/** null means "any". */
export interface TaskFilter {
  tagId: string | null
  priority: Priority | null
}

export const EMPTY_FILTER: TaskFilter = { tagId: null, priority: null }

export function isFilterActive(filter: TaskFilter): boolean {
  return filter.tagId !== null || filter.priority !== null
}

export function filterTasks(tasks: readonly Task[], filter: TaskFilter): Task[] {
  return tasks.filter(
    (task) =>
      (filter.tagId === null || task.tag === filter.tagId) &&
      (filter.priority === null || task.priority === filter.priority),
  )
}

/** Looks in the title, note, checklist and tag name. */
export function taskMatchesQuery(task: Task, query: string, tags: readonly Tag[]): boolean {
  const tag = tags.find((candidate) => candidate.id === task.tag)
  const tagName = tag ? tagDisplayName(tag) : ''
  const text = [task.title, task.note, tagName, ...task.subtasks.map((s) => s.title)].join(' ')
  return matchesQuery(text, query)
}

export function reminderMatchesQuery(reminder: Reminder, query: string): boolean {
  return matchesQuery(`${reminder.title} ${reminder.note}`, query)
}

export interface SearchResults {
  tasks: Task[]
  reminders: Reminder[]
}

/**
 * Tasks (by query and filter) and reminders (by query only: they have no
 * tag or priority, so any active filter hides them).
 */
export function searchAll(
  tasks: readonly Task[],
  reminders: readonly Reminder[],
  tags: readonly Tag[],
  query: string,
  filter: TaskFilter,
): SearchResults {
  return {
    tasks: filterTasks(tasks, filter).filter((task) => taskMatchesQuery(task, query, tags)),
    reminders: isFilterActive(filter)
      ? []
      : reminders.filter((reminder) => reminderMatchesQuery(reminder, query)),
  }
}
