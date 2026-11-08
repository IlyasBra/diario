import { use } from 'react'

import { RemindersContext, type RemindersContextValue } from './RemindersContext'

export function useReminders(): RemindersContextValue {
  const context = use(RemindersContext)
  if (!context) throw new Error('useReminders must be used inside <RemindersProvider>')
  return context
}
