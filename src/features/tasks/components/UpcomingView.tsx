import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon } from '@/components/ui/icons'
import { filterTasks, isFilterActive, type TaskFilter } from '@/features/search/filters'
import { formatDayHeading, type ISODate } from '@/lib/dates'

import { selectUpcomingGroups } from '../selectors'
import { useTaskItemActions } from '../state/useTaskItemActions'
import { useTasks } from '../state/useTasks'
import { type Task } from '../types'
import { TaskSection } from './TaskSection'

interface UpcomingViewProps {
  today: ISODate
  onCreate: () => void
  onEdit: (task: Task) => void
  filter: TaskFilter
}

export function UpcomingView({ today, onCreate, onEdit, filter }: UpcomingViewProps) {
  const { tasks } = useTasks()
  const actions = useTaskItemActions(today, onEdit)
  const groups = selectUpcomingGroups(filterTasks(tasks, filter), today)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Próximos días</h1>

      {groups.length === 0 && isFilterActive(filter) ? (
        <EmptyState
          title="Ninguna tarea coincide con los filtros"
          description="Quita los filtros para ver todas."
        />
      ) : groups.length === 0 ? (
        <EmptyState
          title="No hay nada planeado"
          description="Las tareas de mañana en adelante aparecerán aquí, agrupadas por día."
          action={
            <Button variant="primary" onClick={onCreate}>
              <PlusIcon />
              Planear una tarea
            </Button>
          }
        />
      ) : (
        groups.map((group) => (
          <TaskSection
            key={group.date}
            title={formatDayHeading(group.date, today)}
            tasks={group.tasks}
            today={today}
            draggable
            {...actions}
          />
        ))
      )}
    </div>
  )
}
