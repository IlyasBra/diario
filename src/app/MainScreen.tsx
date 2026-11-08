import { useCallback, useEffect, useRef, useState } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { MainNav } from '@/components/layout/MainNav'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon } from '@/components/ui/icons'
import { Notice } from '@/components/ui/Notice'
import {
  TaskEditorDialog,
  type TaskEditorState,
} from '@/features/tasks/components/TaskEditorDialog'
import { TodayView } from '@/features/tasks/components/TodayView'
import { UpcomingView } from '@/features/tasks/components/UpcomingView'
import { useTasks } from '@/features/tasks/state/useTasks'
import { type Task } from '@/features/tasks/types'
import { useHashRoute } from '@/hooks/useHashRoute'
import { addDaysToISODate, type ISODate } from '@/lib/dates'

import { DEFAULT_ROUTE, NAV_ITEMS, ROUTES } from './routes'

interface MainScreenProps {
  today: ISODate
  isPersistent: boolean
}

export function MainScreen({ today, isPersistent }: MainScreenProps) {
  const route = useHashRoute(ROUTES, DEFAULT_ROUTE)
  const { status, error, dismissError } = useTasks()
  const [editor, setEditor] = useState<TaskEditorState | null>(null)

  useScrollToTopOnRouteChange(route)

  // New tasks default to the day the user is looking at.
  const openCreate = useCallback(() => {
    setEditor({ mode: 'create', date: route === 'hoy' ? today : addDaysToISODate(today, 1) })
  }, [route, today])
  const openEdit = useCallback((task: Task) => {
    setEditor({ mode: 'edit', task })
  }, [])
  const closeEditor = useCallback(() => {
    setEditor(null)
  }, [])

  return (
    <AppShell today={today} nav={<MainNav items={NAV_ITEMS} currentId={route} />}>
      <div className="mb-6 space-y-3 empty:hidden">
        {!isPersistent && (
          <Notice tone="warning">
            Este navegador no permite guardar datos: las tareas se perderán al cerrar la app.
          </Notice>
        )}
        {error && (
          <Notice tone="error" onDismiss={dismissError}>
            {error} Inténtalo de nuevo.
          </Notice>
        )}
      </div>

      {status === 'loading' && <p className="text-slate-600 dark:text-slate-400">Cargando…</p>}
      {status === 'error' && (
        <EmptyState
          title="No se han podido cargar tus tareas"
          description="Recarga la página. Si el problema sigue, revisa el espacio libre del dispositivo."
        />
      )}
      {status === 'ready' &&
        (route === 'hoy' ? (
          <TodayView today={today} onCreate={openCreate} onEdit={openEdit} />
        ) : (
          <UpcomingView today={today} onCreate={openCreate} onEdit={openEdit} />
        ))}

      {status === 'ready' && (
        <Button
          variant="primary"
          onClick={openCreate}
          className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 h-14 rounded-full pr-5 pl-4 shadow-lg md:bottom-8"
        >
          <PlusIcon />
          Nueva tarea
        </Button>
      )}

      <TaskEditorDialog state={editor} today={today} onClose={closeEditor} />
    </AppShell>
  )
}

function useScrollToTopOnRouteChange(route: string) {
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.scrollTo({ top: 0 })
  }, [route])
}
