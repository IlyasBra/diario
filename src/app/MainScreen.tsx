import { useCallback, useEffect, useRef, useState } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { MainNav } from '@/components/layout/MainNav'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon } from '@/components/ui/icons'
import { Notice } from '@/components/ui/Notice'
import {
  ReminderEditorDialog,
  type ReminderEditorState,
} from '@/features/reminders/components/ReminderEditorDialog'
import { RemindersView } from '@/features/reminders/components/RemindersView'
import { useReminders } from '@/features/reminders/state/useReminders'
import { type Reminder } from '@/features/reminders/types'
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

import { DEFAULT_ROUTE, NAV_ITEMS, type Route, ROUTES } from './routes'

const CREATE_LABELS: Record<Route, string> = {
  hoy: 'Nueva tarea',
  proximos: 'Nueva tarea',
  recordatorios: 'Nuevo recordatorio',
}

interface MainScreenProps {
  today: ISODate
  isPersistent: boolean
}

export function MainScreen({ today, isPersistent }: MainScreenProps) {
  const route = useHashRoute(ROUTES, DEFAULT_ROUTE)
  const tasks = useTasks()
  const reminders = useReminders()
  const [taskEditor, setTaskEditor] = useState<TaskEditorState | null>(null)
  const [reminderEditor, setReminderEditor] = useState<ReminderEditorState | null>(null)

  useScrollToTopOnRouteChange(route)

  const status =
    tasks.status === 'error' || reminders.status === 'error'
      ? 'error'
      : tasks.status === 'ready' && reminders.status === 'ready'
        ? 'ready'
        : 'loading'

  // New items default to the day the user is looking at.
  const openCreate = useCallback(() => {
    if (route === 'recordatorios') setReminderEditor({ mode: 'create', date: today })
    else
      setTaskEditor({
        mode: 'create',
        date: route === 'hoy' ? today : addDaysToISODate(today, 1),
      })
  }, [route, today])
  const editTask = useCallback((task: Task) => {
    setTaskEditor({ mode: 'edit', task })
  }, [])
  const editReminder = useCallback((reminder: Reminder) => {
    setReminderEditor({ mode: 'edit', reminder })
  }, [])

  return (
    <AppShell today={today} nav={<MainNav items={NAV_ITEMS} currentId={route} />}>
      <div className="mb-6 space-y-3 empty:hidden">
        {!isPersistent && (
          <Notice tone="warning">
            Este navegador no permite guardar datos: lo que apuntes se perderá al cerrar la app.
          </Notice>
        )}
        {tasks.error && (
          <Notice tone="error" onDismiss={tasks.dismissError}>
            {tasks.error} Inténtalo de nuevo.
          </Notice>
        )}
        {reminders.error && (
          <Notice tone="error" onDismiss={reminders.dismissError}>
            {reminders.error} Inténtalo de nuevo.
          </Notice>
        )}
      </div>

      {status === 'loading' && <p className="text-slate-600 dark:text-slate-400">Cargando…</p>}
      {status === 'error' && (
        <EmptyState
          title="No se han podido cargar tus datos"
          description="Recarga la página. Si el problema sigue, revisa el espacio libre del dispositivo."
        />
      )}
      {status === 'ready' && (
        <>
          {route === 'hoy' && <TodayView today={today} onCreate={openCreate} onEdit={editTask} />}
          {route === 'proximos' && (
            <UpcomingView today={today} onCreate={openCreate} onEdit={editTask} />
          )}
          {route === 'recordatorios' && (
            <RemindersView onCreate={openCreate} onEdit={editReminder} />
          )}

          <Button
            variant="primary"
            onClick={openCreate}
            className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 h-14 rounded-full pr-5 pl-4 shadow-lg md:bottom-8"
          >
            <PlusIcon />
            {CREATE_LABELS[route]}
          </Button>
        </>
      )}

      <TaskEditorDialog
        state={taskEditor}
        today={today}
        onClose={() => {
          setTaskEditor(null)
        }}
      />
      <ReminderEditorDialog
        state={reminderEditor}
        onClose={() => {
          setReminderEditor(null)
        }}
      />
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
