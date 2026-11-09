import { createContext } from 'react'

import { type StoreStatus } from '@/hooks/useRepositoryStore'

import { type Reminder, type ReminderChanges, type ReminderInput } from '../types'

export interface RemindersContextValue {
  reminders: Reminder[]
  status: StoreStatus
  error: string | null
  dismissError: () => void
  createReminder: (input: ReminderInput) => Promise<boolean>
  updateReminder: (id: string, changes: ReminderChanges) => Promise<boolean>
  deleteReminder: (id: string) => Promise<boolean>
  replaceReminders: (reminders: readonly Reminder[]) => Promise<boolean>
  restoreReminder: (reminder: Reminder) => Promise<boolean>
}

export const RemindersContext = createContext<RemindersContextValue | null>(null)
