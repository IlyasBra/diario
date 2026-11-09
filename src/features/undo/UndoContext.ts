import { createContext } from 'react'

export interface UndoContextValue {
  /** Shows a message with a "Deshacer" button for a few seconds. */
  showUndo: (message: string, onUndo: () => void) => void
}

export const UndoContext = createContext<UndoContextValue | null>(null)
