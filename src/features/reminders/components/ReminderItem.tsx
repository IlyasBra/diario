import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PencilIcon, RepeatIcon } from '@/components/ui/icons'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { formatShortDate, formatTime, toISODate } from '@/lib/dates'

import { repeatLabel } from '../labels'
import { type ReminderOccurrence } from '../selectors'
import { type Reminder } from '../types'

interface ReminderItemProps {
  occurrence: ReminderOccurrence
  /** One-off reminder whose day has already passed. */
  isPast?: boolean
  onEdit: (reminder: Reminder) => void
}

export function ReminderItem({ occurrence, isPast = false, onEdit }: ReminderItemProps) {
  const { t } = useI18n()
  const { reminder, at } = occurrence

  return (
    <li
      className={cn(
        'flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800',
        isPast && 'opacity-70',
      )}
    >
      <time
        dateTime={at.toISOString()}
        className="w-12 shrink-0 pt-0.5 text-sm font-semibold text-brand-700 tabular-nums dark:text-brand-400"
      >
        {formatTime(at)}
        {isPast && (
          <span className="block text-xs font-normal text-slate-500">
            {formatShortDate(toISODate(at))}
          </span>
        )}
      </time>

      <div className="min-w-0 flex-1">
        <p className="leading-6 break-words">{reminder.title}</p>
        {reminder.note && (
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {reminder.note}
          </p>
        )}
        {reminder.repeat !== 'none' && (
          <div className="mt-1.5">
            <Badge tone="info">
              <RepeatIcon className="me-1 size-3.5" />
              {repeatLabel(reminder.repeat)}
            </Badge>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          onEdit(reminder)
        }}
        title={t('task.edit')}
        className="-my-1 -me-1"
      >
        <PencilIcon />
        <span className="sr-only">{t('task.editSr', { title: reminder.title })}</span>
      </Button>
    </li>
  )
}
