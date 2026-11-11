import { type CSSProperties, type ReactNode, type Ref, useId } from 'react'

import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ArrowRightIcon, ClockIcon, PencilIcon, RepeatIcon } from '@/components/ui/icons'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { formatShortDate, type ISODate } from '@/lib/dates'

import { TagBadge } from '@/features/tags/components/TagBadge'

import { priorityLabel } from '../labels'
import { describeRepeat, isRecurring } from '../recurrence'
import { isOverdue } from '../selectors'
import { type Priority, type Task } from '../types'

const PRIORITY_TONES: Record<Priority, BadgeTone> = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
}

export interface TaskItemActions {
  onToggle: (task: Task) => void
  onToggleSubtask: (task: Task, subtaskId: string) => void
  onPostpone: (task: Task) => void
  onEdit: (task: Task) => void
}

interface TaskItemProps extends TaskItemActions {
  task: Task
  today: ISODate
  /** Set by DraggableTaskItem: the drag handle and the drag state of the row. */
  handle?: ReactNode
  rootRef?: Ref<HTMLLIElement>
  rootStyle?: CSSProperties
  isDragging?: boolean
}

export function TaskItem({
  task,
  today,
  onToggle,
  onToggleSubtask,
  onPostpone,
  onEdit,
  handle,
  rootRef,
  rootStyle,
  isDragging = false,
}: TaskItemProps) {
  const { t } = useI18n()
  const checkboxId = useId()
  const detailsId = useId()
  const overdue = isOverdue(task, today)
  const canPostpone = !task.completed && task.date <= today && !isRecurring(task)
  const doneSubtasks = task.subtasks.filter((subtask) => subtask.done).length

  return (
    <li
      ref={rootRef}
      style={rootStyle}
      className={cn(
        'flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800',
        isDragging && 'shadow-xl ring-2 ring-brand-500',
      )}
    >
      {handle}
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
            {task.time && (
              <Badge>
                <ClockIcon className="me-1 size-3.5" />
                <span className="sr-only">{t('task.at')}</span>
                <time className="tabular-nums">{task.time}</time>
              </Badge>
            )}
            {isRecurring(task) && (
              <Badge tone="info">
                <RepeatIcon className="me-1 size-3.5" />
                {describeRepeat(task)}
              </Badge>
            )}
            {task.subtasks.length > 0 && (
              <Badge>
                <span className="sr-only">{t('task.subtasksDone')}</span>
                {doneSubtasks}/{task.subtasks.length}
              </Badge>
            )}
            {overdue && (
              <Badge tone="danger">
                {t('task.overdueBadge', { date: formatShortDate(task.date) })}
              </Badge>
            )}
            <Badge tone={PRIORITY_TONES[task.priority]}>
              <span className="sr-only">{t('task.priorityPrefix')}</span>
              {priorityLabel(task.priority)}
            </Badge>
            <TagBadge tagId={task.tag} />
          </div>
          {task.subtasks.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {task.subtasks.map((subtask) => (
                <li key={subtask.id}>
                  <label className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      checked={subtask.done}
                      onChange={() => {
                        onToggleSubtask(task, subtask.id)
                      }}
                      className="size-5 shrink-0 cursor-pointer rounded accent-brand-600"
                    />
                    <span
                      className={cn(
                        'break-words',
                        subtask.done && 'text-slate-500 line-through dark:text-slate-500',
                      )}
                    >
                      {subtask.title}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="-my-1 -me-1 flex shrink-0">
        {canPostpone && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onPostpone(task)
            }}
            title={t('task.postpone')}
          >
            <ArrowRightIcon />
            <span className="sr-only">{t('task.postponeSr', { title: task.title })}</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            onEdit(task)
          }}
          title={t('task.edit')}
        >
          <PencilIcon />
          <span className="sr-only">{t('task.editSr', { title: task.title })}</span>
        </Button>
      </div>
    </li>
  )
}
