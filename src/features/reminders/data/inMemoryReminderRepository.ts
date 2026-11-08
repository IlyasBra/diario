import { InMemoryRepository } from '@/lib/data/inMemoryRepository'

import { reminderModel } from '../model'
import { type Reminder, type ReminderChanges, type ReminderInput } from '../types'

export class InMemoryReminderRepository extends InMemoryRepository<
  Reminder,
  ReminderInput,
  ReminderChanges
> {
  constructor(initialReminders: readonly Reminder[] = []) {
    super(reminderModel, initialReminders)
  }
}
