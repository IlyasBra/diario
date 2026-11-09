import { buildDefaultTags } from '@/features/tags/defaults'
import { isTagColor } from '@/features/tags/model'
import { type Tag } from '@/features/tags/types'
import {
  PRIORITIES,
  type Subtask,
  type Task,
  type TaskRepeat,
  type WeekdayIndex,
} from '@/features/tasks/types'
import { REPEATS, type Reminder } from '@/features/reminders/types'
import { isISODate, isTimeString } from '@/lib/dates'

export const BACKUP_APP = 'diario'
/**
 * v1 had fixed tags and no `tags` list; v2 stores the user's tags; v3 adds
 * repeating tasks and checklists. Older backups still import.
 */
export const BACKUP_VERSION = 3

/** Everything the app stores, in a format meant to be saved as a .json file. */
export interface BackupFile {
  app: typeof BACKUP_APP
  version: number
  /** ISO timestamp of the export. */
  exportedAt: string
  tasks: Task[]
  reminders: Reminder[]
  tags: Tag[]
}

export type ParseBackupResult = { ok: true; backup: BackupFile } | { ok: false; error: string }

export function createBackup(
  tasks: readonly Task[],
  reminders: readonly Reminder[],
  tags: readonly Tag[],
  now: Date,
): BackupFile {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    tasks: [...tasks],
    reminders: [...reminders],
    tags: [...tags],
  }
}

export function backupFileName(now: Date): string {
  return `diario-copia-${now.toISOString().slice(0, 10)}.json`
}

/**
 * Parses and validates a backup. Imported files are untrusted input, so every
 * field is checked: a corrupt or foreign file must never reach the database.
 */
export function parseBackup(text: string): ParseBackupResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return fail('El archivo no es un JSON válido.')
  }

  if (!isRecord(data) || data.app !== BACKUP_APP) {
    return fail('Este archivo no es una copia de seguridad de Diario.')
  }
  if (typeof data.version !== 'number' || data.version > BACKUP_VERSION) {
    return fail(
      'La copia es de una versión más nueva de la app. Actualiza Diario e inténtalo de nuevo.',
    )
  }
  if (typeof data.exportedAt !== 'string') return fail('Faltan datos en la copia.')
  if (!Array.isArray(data.tasks) || !Array.isArray(data.reminders)) {
    return fail('Faltan datos en la copia.')
  }

  const tasks: Task[] = []
  for (const item of data.tasks as unknown[]) {
    const task = readTask(item)
    if (!task) return fail('La copia contiene tareas con datos no válidos.')
    tasks.push(task)
  }
  const reminders: Reminder[] = []
  for (const item of data.reminders as unknown[]) {
    if (!isReminder(item)) return fail('La copia contiene recordatorios con datos no válidos.')
    reminders.push(item)
  }

  // Version 1 backups predate custom tags: they used the default ones.
  const tags: Tag[] = []
  if (data.tags === undefined) {
    tags.push(...buildDefaultTags(new Date(data.exportedAt)))
  } else if (Array.isArray(data.tags)) {
    for (const item of data.tags as unknown[]) {
      if (!isTag(item)) return fail('La copia contiene etiquetas con datos no válidos.')
      tags.push(item)
    }
  } else {
    return fail('Faltan datos en la copia.')
  }

  if (hasDuplicateIds(tasks) || hasDuplicateIds(reminders) || hasDuplicateIds(tags)) {
    return fail('La copia contiene elementos repetidos.')
  }
  const tagIds = new Set(tags.map((tag) => tag.id))
  if (tasks.some((task) => !tagIds.has(task.tag))) {
    return fail('La copia contiene tareas con etiquetas desconocidas.')
  }

  return {
    ok: true,
    backup: {
      app: BACKUP_APP,
      version: data.version,
      exportedAt: data.exportedAt,
      tasks,
      reminders,
      tags,
    },
  }
}

function fail(error: string): ParseBackupResult {
  return { ok: false, error }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasDuplicateIds(items: readonly { id: string }[]): boolean {
  return new Set(items.map((item) => item.id)).size !== items.length
}

function isIncluded<T extends string>(options: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value)
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

/**
 * Validates one task. Fields added in later versions (repeat, doneDates,
 * subtasks) are optional in old backups and get their default value.
 */
function readTask(value: unknown): Task | null {
  if (!(
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.id !== '' &&
    typeof value.title === 'string' &&
    typeof value.note === 'string' &&
    typeof value.date === 'string' &&
    isISODate(value.date) &&
    (value.time === null || (typeof value.time === 'string' && isTimeString(value.time))) &&
    isIncluded(PRIORITIES, value.priority) &&
    typeof value.tag === 'string' &&
    value.tag !== '' &&
    typeof value.completed === 'boolean' &&
    (value.completedAt === null || isTimestamp(value.completedAt)) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt)
  )) {
    return null
  }

  const repeat = value.repeat === undefined ? ({ kind: 'none' } as const) : readRepeat(value.repeat)
  const doneDates = value.doneDates === undefined ? [] : readDoneDates(value.doneDates)
  const subtasks = value.subtasks === undefined ? [] : readSubtasks(value.subtasks)
  if (!repeat || !doneDates || !subtasks) return null

  return {
    id: value.id,
    title: value.title,
    note: value.note,
    date: value.date,
    time: value.time,
    priority: value.priority,
    tag: value.tag,
    completed: value.completed,
    completedAt: value.completedAt,
    repeat,
    doneDates,
    subtasks,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  }
}

function readRepeat(value: unknown): TaskRepeat | null {
  if (!isRecord(value)) return null
  switch (value.kind) {
    case 'none':
    case 'daily':
    case 'monthly':
      return { kind: value.kind }
    case 'weekly': {
      const days = value.days
      const valid =
        Array.isArray(days) &&
        days.length > 0 &&
        days.every((day) => Number.isInteger(day) && (day as number) >= 0 && (day as number) <= 6)
      return valid ? { kind: 'weekly', days: days as WeekdayIndex[] } : null
    }
    default:
      return null
  }
}

function readDoneDates(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((day) => typeof day === 'string' && isISODate(day))
    ? value
    : null
}

function readSubtasks(value: unknown): Subtask[] | null {
  if (!Array.isArray(value)) return null
  const subtasks: Subtask[] = []
  for (const item of value as unknown[]) {
    if (!(
      isRecord(item) &&
      typeof item.id === 'string' &&
      item.id !== '' &&
      typeof item.title === 'string' &&
      typeof item.done === 'boolean'
    )) {
      return null
    }
    subtasks.push({ id: item.id, title: item.title, done: item.done })
  }
  return subtasks
}

function isReminder(value: unknown): value is Reminder {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.id !== '' &&
    typeof value.title === 'string' &&
    typeof value.note === 'string' &&
    typeof value.date === 'string' &&
    isISODate(value.date) &&
    typeof value.time === 'string' &&
    isTimeString(value.time) &&
    isIncluded(REPEATS, value.repeat) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt)
  )
}

function isTag(value: unknown): value is Tag {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.id !== '' &&
    typeof value.name === 'string' &&
    value.name.trim() !== '' &&
    isTagColor(value.color) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt)
  )
}
