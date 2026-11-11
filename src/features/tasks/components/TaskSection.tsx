import { useId } from 'react'

import { cn } from '@/lib/cn'
import { type ISODate } from '@/lib/dates'

import { type Task } from '../types'
import { isRecurring } from '../recurrence'
import { DraggableTaskItem } from './DraggableTaskItem'
import { TaskItem, type TaskItemActions } from './TaskItem'

interface TaskSectionProps extends TaskItemActions {
  title: string
  tasks: Task[]
  today: ISODate
  tone?: 'default' | 'danger'
  /** Show a handle to drag one-off tasks to another day (needs <TaskDragProvider>). */
  draggable?: boolean
}

/** A titled group of tasks: "Atrasadas", "Hoy", "Mañana"… */
export function TaskSection({
  title,
  tasks,
  today,
  tone = 'default',
  draggable = false,
  ...actions
}: TaskSectionProps) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className={cn(
          // Block (not flex) so ::first-letter capitalises "martes" → "Martes".
          'mb-2 text-sm font-semibold first-letter:uppercase',
          tone === 'danger'
            ? 'text-red-700 dark:text-red-400'
            : 'text-slate-600 dark:text-slate-400',
        )}
      >
        {title}
        <span className="ms-1.5 font-normal">({tasks.length})</span>
      </h2>
      <ul className="space-y-2">
        {tasks.map((task) =>
          draggable && !isRecurring(task) ? (
            <DraggableTaskItem key={task.id} task={task} today={today} {...actions} />
          ) : (
            <TaskItem key={task.id} task={task} today={today} {...actions} />
          ),
        )}
      </ul>
    </section>
  )
}
