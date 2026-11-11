import { useCallback, useEffect, useRef, useState } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { MainNav } from '@/components/layout/MainNav'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon, SearchIcon, SettingsIcon } from '@/components/ui/icons'
import { Notice } from '@/components/ui/Notice'
import { CalendarView } from '@/features/calendar/components/CalendarView'
import { StatsView } from '@/features/stats/components/StatsView'
import { FilterBar } from '@/features/search/components/FilterBar'
import { SearchView } from '@/features/search/components/SearchView'
import { EMPTY_FILTER, isFilterActive, type TaskFilter } from '@/features/search/filters'
import { InAppAlerts } from '@/features/notifications/components/InAppAlerts'
import { NotificationPrompt } from '@/features/notifications/components/NotificationPrompt'
import { SettingsDialog } from '@/features/settings/components/SettingsDialog'
import { useTheme } from '@/features/settings/useTheme'
import { useAlertScheduler } from '@/features/notifications/useAlertScheduler'
import {
  ReminderEditorDialog,
  type ReminderEditorState,
} from '@/features/reminders/components/ReminderEditorDialog'
import { RemindersView } from '@/features/reminders/components/RemindersView'
import { useTags } from '@/features/tags/state/useTags'
import { useReminders } from '@/features/reminders/state/useReminders'
import { type Reminder } from '@/features/reminders/types'
import {
  TaskEditorDialog,
  type TaskEditorState,
} from '@/features/tasks/components/TaskEditorDialog'
import { TaskDragProvider } from '@/features/tasks/components/TaskDragProvider'
import { TodayView } from '@/features/tasks/components/TodayView'
import { UpcomingView } from '@/features/tasks/components/UpcomingView'
import { useTasks } from '@/features/tasks/state/useTasks'
import { type Task } from '@/features/tasks/types'
import { UndoProvider } from '@/features/undo/UndoProvider'
import { useHashRoute } from '@/hooks/useHashRoute'
import { usePersistentStorage } from '@/hooks/usePersistentStorage'
import { useI18n } from '@/i18n'
import { addDaysToISODate, type ISODate } from '@/lib/dates'

import { DEFAULT_ROUTE, navItems, ROUTES } from './routes'

interface MainScreenProps {
  today: ISODate
  isPersistent: boolean
}

export function MainScreen({ today, isPersistent }: MainScreenProps) {
  const { t } = useI18n()
  const route = useHashRoute(ROUTES, DEFAULT_ROUTE)
  const tasks = useTasks()
  const reminders = useReminders()
  const tags = useTags()
  const [taskEditor, setTaskEditor] = useState<TaskEditorState | null>(null)
  const [reminderEditor, setReminderEditor] = useState<ReminderEditorState | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [filter, setFilter] = useState<TaskFilter>(EMPTY_FILTER)
  const [calendarDay, setCalendarDay] = useState(today)
  const theme = useTheme()
  const isStoragePersistent = usePersistentStorage()

  useScrollToTopOnRouteChange(route)

  const status =
    tasks.status === 'error' || reminders.status === 'error' || tags.status === 'error'
      ? 'error'
      : tasks.status === 'ready' && reminders.status === 'ready' && tags.status === 'ready'
        ? 'ready'
        : 'loading'

  const { inAppAlerts, dismissAlert } = useAlertScheduler(
    reminders.reminders,
    tasks.tasks,
    status === 'ready',
  )

  // New items default to the day the user is looking at.
  const openCreate = useCallback(() => {
    if (route === 'recordatorios') setReminderEditor({ mode: 'create', date: today })
    else
      setTaskEditor({
        mode: 'create',
        date:
          route === 'proximos'
            ? addDaysToISODate(today, 1)
            : route === 'calendario'
              ? calendarDay
              : today,
      })
  }, [route, today, calendarDay])
  const editTask = useCallback((task: Task) => {
    setTaskEditor({ mode: 'edit', task })
  }, [])
  const editReminder = useCallback((reminder: Reminder) => {
    setReminderEditor({ mode: 'edit', reminder })
  }, [])

  return (
    <UndoProvider>
      <AppShell
        today={today}
        nav={<MainNav items={navItems(t)} currentId={route} />}
        headerActions={
          <>
            <a
              href="#buscar"
              aria-current={route === 'buscar' ? 'page' : undefined}
              className="inline-flex size-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <SearchIcon />
              <span className="sr-only">{t('header.search')}</span>
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSettingsOpen(true)
              }}
              className="-me-2"
            >
              <SettingsIcon />
              <span className="sr-only">{t('header.settings')}</span>
            </Button>
          </>
        }
      >
        <div className="mb-6 space-y-3 empty:hidden">
          {!isPersistent && <Notice tone="warning">{t('main.noStorage')}</Notice>}
          {tasks.error && (
            <Notice tone="error" onDismiss={tasks.dismissError}>
              {tasks.error} {t('main.retry')}
            </Notice>
          )}
          {reminders.error && (
            <Notice tone="error" onDismiss={reminders.dismissError}>
              {reminders.error} {t('main.retry')}
            </Notice>
          )}
        </div>

        {status === 'loading' && (
          <p className="text-slate-600 dark:text-slate-400">{t('common.loading')}</p>
        )}
        {status === 'error' && (
          <EmptyState
            title={t('main.loadErrorTitle')}
            description={t('main.loadErrorDescription')}
          />
        )}
        {status === 'ready' && (
          <>
            {(route === 'hoy' || route === 'proximos') && (
              <details className="mb-6 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800">
                <summary className="flex min-h-11 cursor-pointer items-center px-3 text-sm font-medium">
                  {isFilterActive(filter) ? t('filters.summaryActive') : t('filters.summary')}
                </summary>
                <div className="px-3 pb-3">
                  <FilterBar filter={filter} onChange={setFilter} />
                </div>
              </details>
            )}
            {route === 'hoy' && (
              <TaskDragProvider today={today}>
                <TodayView today={today} onCreate={openCreate} onEdit={editTask} filter={filter} />
              </TaskDragProvider>
            )}
            {route === 'proximos' && (
              <TaskDragProvider today={today}>
                <UpcomingView
                  today={today}
                  onCreate={openCreate}
                  onEdit={editTask}
                  filter={filter}
                />
              </TaskDragProvider>
            )}
            {route === 'calendario' && (
              <CalendarView
                today={today}
                selectedDate={calendarDay}
                onSelectDate={setCalendarDay}
                onCreateTask={(date) => {
                  setTaskEditor({ mode: 'create', date })
                }}
                onEditTask={editTask}
                onEditReminder={editReminder}
              />
            )}
            {route === 'resumen' && <StatsView today={today} />}
            {route === 'buscar' && (
              <SearchView today={today} onEditTask={editTask} onEditReminder={editReminder} />
            )}
            {route === 'recordatorios' && (
              <RemindersView
                onCreate={openCreate}
                onEdit={editReminder}
                banner={<NotificationPrompt />}
              />
            )}

            <Button
              variant="primary"
              onClick={openCreate}
              className="fixed end-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 h-14 rounded-full ps-4 pe-5 shadow-lg md:bottom-8"
            >
              <PlusIcon />
              {route === 'recordatorios' ? t('main.newReminder') : t('main.newTask')}
            </Button>
          </>
        )}

        <InAppAlerts alerts={inAppAlerts} onDismiss={dismissAlert} />

        <SettingsDialog
          open={settingsOpen}
          onClose={() => {
            setSettingsOpen(false)
          }}
          theme={{ preference: theme.preference, onChange: theme.setPreference }}
          isStoragePersistent={isStoragePersistent}
        />
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
    </UndoProvider>
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
