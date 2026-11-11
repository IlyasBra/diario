import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon } from '@/components/ui/icons'
import { filterTasks, isFilterActive, type TaskFilter } from '@/features/search/filters'
import { useI18n } from '@/i18n'
import { type ISODate } from '@/lib/dates'

import { selectTodayTasks, summarizeDay } from '../selectors'
import { useTaskItemActions } from '../state/useTaskItemActions'
import { useTasks } from '../state/useTasks'
import { type Task } from '../types'
import { DaySummary } from './DaySummary'
import { TaskSection } from './TaskSection'

interface TodayViewProps {
  today: ISODate
  onCreate: () => void
  onEdit: (task: Task) => void
  filter: TaskFilter
}

export function TodayView({ today, onCreate, onEdit, filter }: TodayViewProps) {
  const { t } = useI18n()
  const { tasks } = useTasks()
  const actions = useTaskItemActions(today, onEdit)
  const { overdue, today: todayTasks } = selectTodayTasks(filterTasks(tasks, filter), today)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('today.title')}</h1>
      <DaySummary summary={summarizeDay(tasks, today)} />

      {overdue.length > 0 && (
        <TaskSection
          title={t('today.overdue')}
          tone="danger"
          tasks={overdue}
          today={today}
          draggable
          {...actions}
        />
      )}

      {todayTasks.length > 0 ? (
        <TaskSection
          title={t('today.title')}
          tasks={todayTasks}
          today={today}
          draggable
          {...actions}
        />
      ) : isFilterActive(filter) ? (
        overdue.length === 0 && (
          <EmptyState
            title={t('today.filteredTitle')}
            description={t('today.filteredDescription')}
          />
        )
      ) : (
        <EmptyState
          title={t('today.emptyTitle')}
          description={t('today.emptyDescription')}
          action={
            <Button variant="primary" onClick={onCreate}>
              <PlusIcon />
              {t('task.add')}
            </Button>
          }
        />
      )}
    </div>
  )
}
