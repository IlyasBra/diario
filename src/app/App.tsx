import { Suspense, use } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { getRepositories } from '@/db/getRepositories'
import { TagsProvider } from '@/features/tags/state/TagsProvider'
import { RemindersProvider } from '@/features/reminders/state/RemindersProvider'
import { TasksProvider } from '@/features/tasks/state/TasksProvider'
import { useToday } from '@/hooks/useToday'
import { type ISODate } from '@/lib/dates'

import { MainScreen } from './MainScreen'

export function App() {
  const today = useToday()

  return (
    <Suspense
      fallback={
        <AppShell today={today}>
          <p className="text-slate-600 dark:text-slate-400">Cargando…</p>
        </AppShell>
      }
    >
      <DataLayer today={today} />
    </Suspense>
  )
}

/** Waits for the database to open (suspending meanwhile) and provides data. */
function DataLayer({ today }: { today: ISODate }) {
  const repositories = use(getRepositories())

  return (
    <TagsProvider repository={repositories.tags}>
      <TasksProvider repository={repositories.tasks}>
        <RemindersProvider repository={repositories.reminders}>
          <MainScreen today={today} isPersistent={repositories.isPersistent} />
        </RemindersProvider>
      </TasksProvider>
    </TagsProvider>
  )
}
