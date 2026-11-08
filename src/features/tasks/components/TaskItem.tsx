import { useId } from 'react'

import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ArrowRightIcon, PencilIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import { formatShortDate, type ISODate } from '@/lib/dates'

import { PRIORITY_LABELS, TAG_LABELS } from '../labels'
import { isOverdue } from '../selectors'
import { type Priority, type Task } from '../types'

const PRIORITY_TONES: Record<Priority, BadgeTone> = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
}

export interface TaskItemActions {
  onToggle: (task: Task) => void
  onPostpone: (task: Task) => void
  onEdit: (task: Task) => void
}

interface TaskItemProps extends TaskItemActions {
  task: Task
  today: ISODate
}

export function TaskItem({ task, today, onToggle, onPostpone, onEdit }: TaskItemProps) {
  const checkboxId = useId()
  const detailsId = useId()
  const overdue = isOverdue(task, today)
  const canPostpone = !task.completed && task.date <= today

  return (
    <li className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <input
        id={checkboxId}
        type="checkbox"
        checked={task.completed}
        onChange={() => {
          onToggle(task)
        }}
        aria-describedby={detailsId}
        className="mt-0.5 size-6 shrink-0 cursor-pointer rounded accent-brand-600"
      />

      <div className="min-w-0 flex-1">
        <label
          htmlFor={checkboxId}
          className={cn(
            'block cursor-pointer leading-6 break-words',
            task.completed && 'text-slate-500 line-through dark:text-slate-500',
          )}
        >
          {task.title}
        </label>

        <div id={detailsId}>
          {task.note && (
            <p className="mt-0.5 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
              {task.note}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {overdue && <Badge tone="danger">Atrasada · {formatShortDate(task.date)}</Badge>}
            <Badge tone={PRIORITY_TONES[task.priority]}>
              <span className="sr-only">Prioridad </span>
              {PRIORITY_LABELS[task.priority]}
            </Badge>
            <Badge>{TAG_LABELS[task.tag]}</Badge>
          </div>
        </div>
      </div>

      <div className="-my-1 -mr-1 flex shrink-0">
        {canPostpone && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onPostpone(task)
            }}
            title="Pasar a mañana"
          >
            <ArrowRightIcon />
            <span className="sr-only">Pasar «{task.title}» a mañana</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            onEdit(task)
          }}
          title="Editar"
        >
          <PencilIcon />
          <span className="sr-only">Editar «{task.title}»</span>
        </Button>
      </div>
    </li>
  )
}
