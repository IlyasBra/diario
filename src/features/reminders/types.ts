import { type ISODate, type TimeString } from '@/lib/dates'

export const REPEATS = ['none', 'monthly', 'yearly'] as const
export type Repeat = (typeof REPEATS)[number]

export interface Reminder {
  id: string
  title: string
  /** Empty string when the reminder has no note. */
  note: string
  /** First (or only) day of the reminder. */
  date: ISODate
  time: TimeString
  repeat: Repeat
  createdAt: string
  updatedAt: string
}

export type ReminderInput = Pick<Reminder, 'title' | 'note' | 'date' | 'time' | 'repeat'>
export type ReminderChanges = Partial<ReminderInput>
