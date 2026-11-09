import { use } from 'react'

import { UndoContext, type UndoContextValue } from './UndoContext'

export function useUndo(): UndoContextValue {
  const context = use(UndoContext)
  if (!context) throw new Error('useUndo must be used inside <UndoProvider>')
  return context
}
