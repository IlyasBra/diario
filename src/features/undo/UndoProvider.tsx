import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/Button'

import { UndoContext, type UndoContextValue } from './UndoContext'

/** How long the "Deshacer" message stays on screen. */
export const UNDO_DURATION_MS = 6000

interface PendingUndo {
  /** Distinguishes messages with the same text, so the timer restarts. */
  id: number
  message: string
  onUndo: () => void
}

/** Provides showUndo() and renders the message at the bottom of the screen. */
export function UndoProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingUndo | null>(null)

  const showUndo = useCallback((message: string, onUndo: () => void) => {
    setPending((current) => ({ id: (current?.id ?? 0) + 1, message, onUndo }))
  }, [])

  const value = useMemo<UndoContextValue>(() => ({ showUndo }), [showUndo])

  useEffect(() => {
    if (!pending) return
    const timer = setTimeout(() => {
      setPending(null)
    }, UNDO_DURATION_MS)
    return () => {
      clearTimeout(timer)
    }
  }, [pending])

  return (
    <UndoContext value={value}>
      {children}
      {pending && (
        <div className="fixed inset-x-0 bottom-[calc(9rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-md px-4 md:bottom-8">
          <div
            role="status"
            className="flex w-full items-center gap-3 rounded-xl bg-slate-900 py-1.5 pr-1.5 pl-4 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900"
          >
            <p className="flex-1">{pending.message}</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                pending.onUndo()
                setPending(null)
              }}
              className="text-brand-100! hover:bg-white/10 hover:text-white! dark:text-brand-700! dark:hover:bg-slate-900/10 dark:hover:text-brand-700!"
            >
              Deshacer
            </Button>
          </div>
        </div>
      )}
    </UndoContext>
  )
}
