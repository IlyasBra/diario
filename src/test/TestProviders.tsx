import { type ReactNode } from 'react'

import { RemindersProvider } from '@/features/reminders/state/RemindersProvider'
import { TagsProvider } from '@/features/tags/state/TagsProvider'
import { TasksProvider } from '@/features/tasks/state/TasksProvider'

import { type TestRepositories } from './repositories'

/** Every data provider the screens need, backed by the given repositories. */
export function TestProviders({
  repositories,
  children,
}: {
  repositories: TestRepositories
  children: ReactNode
}) {
  return (
    <TagsProvider repository={repositories.tags}>
      <TasksProvider repository={repositories.tasks}>
        <RemindersProvider repository={repositories.reminders}>{children}</RemindersProvider>
      </TasksProvider>
    </TagsProvider>
  )
}
