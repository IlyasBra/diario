import { t } from '@/i18n'
import { type EntityModel } from '@/lib/data/repository'
import { isISODate, isTimeString } from '@/lib/dates'

import { type Reminder, type ReminderChanges, type ReminderInput } from './types'

export const TITLE_MAX_LENGTH = 120
export const NOTE_MAX_LENGTH = 1000

export function buildReminder(input: ReminderInput, id: string, now: Date): Reminder {
  const timestamp = now.toISOString()
  return { id, ...normalizeInput(input), createdAt: timestamp, updatedAt: timestamp }
}

export function applyReminderChanges(
  reminder: Reminder,
  changes: ReminderChanges,
  now: Date,
): Reminder {
  return {
    ...reminder,
    ...normalizeInput({ ...reminder, ...changes }),
    updatedAt: now.toISOString(),
  }
}

/** Domain rules used by every reminder repository implementation. */
export const reminderModel: EntityModel<Reminder, ReminderInput, ReminderChanges> = {
  build: buildReminder,
  applyChanges: applyReminderChanges,
}

export function toReminderInput(reminder: Reminder): ReminderInput {
  const { title, note, date, time, repeat } = reminder
  return { title, note, date, time, repeat }
}

function normalizeInput(input: ReminderInput): ReminderInput {
  return {
    title: input.title.trim(),
    note: input.note.trim(),
    date: input.date,
    time: input.time,
    repeat: input.repeat,
  }
}

export interface ReminderInputErrors {
  title?: string
  date?: string
  time?: string
}

export function validateReminderInput(input: ReminderInput): ReminderInputErrors {
  const errors: ReminderInputErrors = {}
  const title = input.title.trim()

  if (title.length === 0) errors.title = t('error.titleRequired')
  else if (title.length > TITLE_MAX_LENGTH)
    errors.title = t('error.titleTooLong', { max: TITLE_MAX_LENGTH })

  if (!isISODate(input.date)) errors.date = t('error.dateRequired')
  if (!isTimeString(input.time)) errors.time = t('error.timeRequired')

  return errors
}
