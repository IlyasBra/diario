import { type EntityModel } from '@/lib/data/repository'
import { isISODate, isTimeString } from '@/lib/dates'

import { createId } from '@/lib/id'

import { type Subtask, type Task, type TaskChanges, type TaskInput, type TaskRepeat } from './types'

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
    doneDates: [],
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
  if (changes.doneDates !== undefined) next.doneDates = [...changes.doneDates].sort()

  if (changes.completed !== undefined && changes.completed !== task.completed) {
    next.completed = changes.completed
    next.completedAt = changes.completed ? timestamp : null
  }

  return next
}

/** Domain rules used by every TaskRepository implementation. */
export const taskModel: EntityModel<Task, TaskInput, TaskChanges> = {
  build: buildTask,
  applyChanges: applyTaskChanges,
}

/** The editable fields of a task, e.g. to prefill the edit form. */
export function toTaskInput(task: Task): TaskInput {
  const { title, note, date, time, priority, tag, repeat, subtasks } = task
  return { title, note, date, time, priority, tag, repeat, subtasks }
}

function normalizeInput(input: TaskInput): TaskInput {
  return {
    title: input.title.trim(),
    note: input.note.trim(),
    date: input.date,
    time: input.time,
    priority: input.priority,
    tag: input.tag,
    repeat: normalizeRepeat(input.repeat),
    // Checklists are for one-off tasks; empty items are dropped.
    subtasks: input.repeat.kind === 'none' ? normalizeSubtasks(input.subtasks) : [],
  }
}

function normalizeRepeat(repeat: TaskRepeat): TaskRepeat {
  return repeat.kind === 'weekly'
    ? { kind: 'weekly', days: [...new Set(repeat.days)].sort() }
    : repeat
}

function normalizeSubtasks(subtasks: readonly Subtask[]): Subtask[] {
  return subtasks
    .map((subtask) => ({ ...subtask, title: subtask.title.trim() }))
    .filter((subtask) => subtask.title !== '')
}

/** A new, empty checklist item. */
export function newSubtask(title = ''): Subtask {
  return { id: createId(), title, done: false }
}

export interface TaskInputErrors {
  title?: string
  date?: string
  time?: string
  repeat?: string
}

/** Form validation. Returns an empty object when the input is valid. */
export function validateTaskInput(input: TaskInput): TaskInputErrors {
  const errors: TaskInputErrors = {}
  const title = input.title.trim()

  if (title.length === 0) errors.title = 'Escribe un título.'
  else if (title.length > TITLE_MAX_LENGTH)
    errors.title = `El título no puede superar ${TITLE_MAX_LENGTH} caracteres.`

  if (!isISODate(input.date)) errors.date = 'Elige una fecha.'
  if (input.time !== null && !isTimeString(input.time)) errors.time = 'Escribe una hora válida.'
  if (input.repeat.kind === 'weekly' && input.repeat.days.length === 0)
    errors.repeat = 'Elige al menos un día de la semana.'

  return errors
}
