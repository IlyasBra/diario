import { type ReactNode, useMemo } from 'react'

import { type StoreErrorMessages, useRepositoryStore } from '@/hooks/useRepositoryStore'
import { useI18n } from '@/i18n'

import { type ReminderRepository } from '../data/reminderRepository'
import { reminderModel } from '../model'
import { RemindersContext, type RemindersContextValue } from './RemindersContext'

interface RemindersProviderProps {
  repository: ReminderRepository
  children: ReactNode
}

export function RemindersProvider({ repository, children }: RemindersProviderProps) {
  const { t } = useI18n()
  const messages = useMemo<StoreErrorMessages>(
    () => ({
      create: t('store.reminder.create'),
      update: t('store.reminder.update'),
      remove: t('store.reminder.remove'),
      replace: t('store.reminder.replace'),
    }),
    [t],
  )
  const store = useRepositoryStore(repository, reminderModel, messages)

  const value = useMemo<RemindersContextValue>(
    () => ({
      reminders: store.items,
      status: store.status,
      error: store.error,
      dismissError: store.dismissError,
      createReminder: store.create,
      updateReminder: store.update,
      deleteReminder: store.remove,
      replaceReminders: store.replaceAll,
      restoreReminder: store.restore,
    }),
    [store],
  )

  return <RemindersContext value={value}>{children}</RemindersContext>
}
