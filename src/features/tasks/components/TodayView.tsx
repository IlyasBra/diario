import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon } from '@/components/ui/icons'
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
}

export function TodayView({ today, onCreate, onEdit }: TodayViewProps) {
  const { tasks } = useTasks()
  const actions = useTaskItemActions(today, onEdit)
  const { overdue, today: todayTasks } = selectTodayTasks(tasks, today)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Hoy</h1>
      <DaySummary summary={summarizeDay(tasks, today)} />

      {overdue.length > 0 && (
        <TaskSection title="Atrasadas" tone="danger" tasks={overdue} today={today} {...actions} />
      )}

      {todayTasks.length > 0 ? (
        <TaskSection title="Hoy" tasks={todayTasks} today={today} {...actions} />
      ) : (
        <EmptyState
          title="Nada planeado para hoy"
          description="Añade lo que quieras hacer hoy y márcalo cuando lo termines."
          action={
            <Button variant="primary" onClick={onCreate}>
              <PlusIcon />
              Añadir tarea
            </Button>
          }
        />
      )}
    </div>
  )
}
