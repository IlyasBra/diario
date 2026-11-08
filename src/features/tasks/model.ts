import { isISODate } from '@/lib/dates'

import { type Task, type TaskChanges, type TaskInput } from './types'

export const TITLE_MAX_LENGTH = 120
export const NOTE_MAX_LENGTH = 1000

/** Builds a new pending task. Pure: id and time are passed in. */
export function buildTask(input: TaskInput, id: string, now: Date): Task {
  const timestamp = now.toISOString()
  return {
    id,
    ...normalizeInput(input),
    completed: false,
    completedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

/**
 * Returns a new task with `changes` applied. Keeps `completedAt` in sync with
 * `completed`, so no caller can leave them inconsistent.
 */
export function applyTaskChanges(task: Task, changes: TaskChanges, now: Date): Task {
  const timestamp = now.toISOString()
  const next: Task = { ...task, ...normalizeInput({ ...task, ...changes }), updatedAt: timestamp }

  if (changes.completed !== undefined && changes.completed !== task.completed) {
    next.completed = changes.completed
    next.completedAt = changes.completed ? timestamp : null
  }

  return next
}

/** The editable fields of a task, e.g. to prefill the edit form. */
export function toTaskInput(task: Task): TaskInput {
  const { title, note, date, priority, tag } = task
  return { title, note, date, priority, tag }
}

function normalizeInput(input: TaskInput): TaskInput {
  return {
    title: input.title.trim(),
    note: input.note.trim(),
    date: input.date,
    priority: input.priority,
    tag: input.tag,
  }
}

export interface TaskInputErrors {
  title?: string
  date?: string
}

/** Form validation. Returns an empty object when the input is valid. */
export function validateTaskInput(input: TaskInput): TaskInputErrors {
  const errors: TaskInputErrors = {}
  const title = input.title.trim()

  if (title.length === 0) errors.title = 'Escribe un título.'
  else if (title.length > TITLE_MAX_LENGTH)
    errors.title = `El título no puede superar ${TITLE_MAX_LENGTH} caracteres.`

  if (!isISODate(input.date)) errors.date = 'Elige una fecha.'

  return errors
}
