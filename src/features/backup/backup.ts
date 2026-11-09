import { PRIORITIES, TAGS, type Task } from '@/features/tasks/types'
import { REPEATS, type Reminder } from '@/features/reminders/types'
import { isISODate, isTimeString } from '@/lib/dates'

export const BACKUP_APP = 'diario'
export const BACKUP_VERSION = 1

/** Everything the app stores, in a format meant to be saved as a .json file. */
export interface BackupFile {
  app: typeof BACKUP_APP
  version: number
  /** ISO timestamp of the export. */
  exportedAt: string
  tasks: Task[]
  reminders: Reminder[]
}

export type ParseBackupResult = { ok: true; backup: BackupFile } | { ok: false; error: string }

export function createBackup(
  tasks: readonly Task[],
  reminders: readonly Reminder[],
  now: Date,
): BackupFile {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    tasks: [...tasks],
    reminders: [...reminders],
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
    if (!isTask(item)) return fail('La copia contiene tareas con datos no válidos.')
    tasks.push(item)
  }
  const reminders: Reminder[] = []
  for (const item of data.reminders as unknown[]) {
    if (!isReminder(item)) return fail('La copia contiene recordatorios con datos no válidos.')
    reminders.push(item)
  }
  if (hasDuplicateIds(tasks) || hasDuplicateIds(reminders)) {
    return fail('La copia contiene elementos repetidos.')
  }

  return {
    ok: true,
    backup: {
      app: BACKUP_APP,
      version: data.version,
      exportedAt: data.exportedAt,
      tasks,
      reminders,
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

function isTask(value: unknown): value is Task {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.id !== '' &&
    typeof value.title === 'string' &&
    typeof value.note === 'string' &&
    typeof value.date === 'string' &&
    isISODate(value.date) &&
    (value.time === null || (typeof value.time === 'string' && isTimeString(value.time))) &&
    isIncluded(PRIORITIES, value.priority) &&
    isIncluded(TAGS, value.tag) &&
    typeof value.completed === 'boolean' &&
    (value.completedAt === null || isTimestamp(value.completedAt)) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt)
  )
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
