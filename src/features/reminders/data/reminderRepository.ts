import { type Repository } from '@/lib/data/repository'

import { type Reminder, type ReminderChanges, type ReminderInput } from '../types'

/** Data access for reminders. See Repository for the contract. */
export type ReminderRepository = Repository<Reminder, ReminderInput, ReminderChanges>
