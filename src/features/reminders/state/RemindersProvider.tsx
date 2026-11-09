import { type ReactNode, useMemo } from 'react'

import { type StoreErrorMessages, useRepositoryStore } from '@/hooks/useRepositoryStore'

import { type ReminderRepository } from '../data/reminderRepository'
import { reminderModel } from '../model'
import { RemindersContext, type RemindersContextValue } from './RemindersContext'

const ERROR_MESSAGES: StoreErrorMessages = {
  create: 'No se ha podido crear el recordatorio.',
  update: 'No se ha podido guardar el recordatorio.',
  remove: 'No se ha podido borrar el recordatorio.',
  replace: 'No se han podido restaurar los recordatorios.',
}

interface RemindersProviderProps {
  repository: ReminderRepository
  children: ReactNode
}

export function RemindersProvider({ repository, children }: RemindersProviderProps) {
  const store = useRepositoryStore(repository, reminderModel, ERROR_MESSAGES)

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
