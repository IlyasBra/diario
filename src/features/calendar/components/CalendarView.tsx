import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import { useI18n } from '@/i18n'
import { formatDayHeading, type ISODate, parseISODate } from '@/lib/dates'
import { ReminderSection } from '@/features/reminders/components/ReminderSection'
import { selectOccurrencesBetween } from '@/features/reminders/selectors'
import { useReminders } from '@/features/reminders/state/useReminders'
import { type Reminder } from '@/features/reminders/types'
import { TaskSection } from '@/features/tasks/components/TaskSection'
import { weekdayName, WEEKDAYS } from '@/features/tasks/recurrence'
import { compareTasks, selectTasksByDay } from '@/features/tasks/selectors'
import { useTaskItemActions } from '@/features/tasks/state/useTaskItemActions'
import { useTasks } from '@/features/tasks/state/useTasks'
import { type Task } from '@/features/tasks/types'
import { combineDateAndTime, toISODate } from '@/lib/dates'

import { buildMonthGrid, firstOfMonth, formatMonthTitle, shiftMonth } from '../monthGrid'

interface CalendarViewProps {
  today: ISODate
  selectedDate: ISODate
  onSelectDate: (date: ISODate) => void
  onCreateTask: (date: ISODate) => void
  onEditTask: (task: Task) => void
  onEditReminder: (reminder: Reminder) => void
}

/** Month grid with a dot per kind of item; tapping a day lists what is planned. */
export function CalendarView({
  today,
  selectedDate,
  onSelectDate,
  onCreateTask,
  onEditTask,
  onEditReminder,
}: CalendarViewProps) {
  const { t, tn } = useI18n()
  const { tasks } = useTasks()
  const { reminders } = useReminders()
  const actions = useTaskItemActions(today, onEditTask)
  // The month on screen is independent from the selected day, so the user can browse freely.
  const [month, setMonth] = useState(() => firstOfMonth(selectedDate))

  const weeks = buildMonthGrid(month)
  const gridStart = weeks[0]?.[0] ?? month
  const gridEnd = weeks.at(-1)?.at(-1) ?? month

  const tasksByDay = selectTasksByDay(tasks, gridStart, gridEnd)
  const reminderDays = new Map<ISODate, number>()
  for (const { at } of selectOccurrencesBetween(
    reminders,
    combineDateAndTime(gridStart, '00:00'),
    combineDateAndTime(gridEnd, '23:59'),
  )) {
    const day = toISODate(at)
    reminderDays.set(day, (reminderDays.get(day) ?? 0) + 1)
  }

  const dayTasks = (tasksByDay.get(selectedDate) ?? []).sort(compareTasks)
  const dayReminders = selectOccurrencesBetween(
    reminders,
    combineDateAndTime(selectedDate, '00:00'),
    combineDateAndTime(selectedDate, '23:59'),
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('calendar.title')}</h1>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setMonth(shiftMonth(month, -1))
          }}
        >
          <ChevronLeftIcon />
          <span className="sr-only">{t('calendar.previous')}</span>
        </Button>
        <h2 aria-live="polite" className="text-lg font-semibold first-letter:uppercase">
          {formatMonthTitle(month)}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setMonth(shiftMonth(month, 1))
          }}
        >
          <ChevronRightIcon />
          <span className="sr-only">{t('calendar.next')}</span>
        </Button>
      </div>

      <div role="grid" aria-label={formatMonthTitle(month)} className="space-y-1">
        <div role="row" className="grid grid-cols-7 text-center text-xs font-medium text-slate-500">
          {WEEKDAYS.map((day) => (
            <span key={day} role="columnheader" aria-hidden="true">
              {weekdayName(day, 'narrow')}
            </span>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={week[0]} role="row" className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const taskCount = tasksByDay.get(day)?.length ?? 0
              const reminderCount = reminderDays.get(day) ?? 0
              const inMonth = day.slice(0, 7) === month.slice(0, 7)
              const label = [
                formatDayHeading(day, today),
                taskCount > 0 ? tn('count.tasks', taskCount) : null,
                reminderCount > 0 ? tn('count.reminders', reminderCount) : null,
              ]
                .filter(Boolean)
                .join(', ')

              return (
                <div key={day} role="gridcell">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDate(day)
                    }}
                    aria-label={label}
                    aria-pressed={day === selectedDate}
                    aria-current={day === today ? 'date' : undefined}
                    className={cn(
                      'flex h-14 w-full flex-col items-center justify-center gap-1 rounded-lg text-sm font-medium tabular-nums',
                      inMonth
                        ? 'text-slate-900 dark:text-slate-100'
                        : 'text-slate-400 dark:text-slate-600',
                      day === today && 'ring-2 ring-brand-500',
                      day === selectedDate
                        ? 'bg-brand-600 !text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                    )}
                  >
                    <span aria-hidden="true">{parseISODate(day).getDate()}</span>
                    <span aria-hidden="true" className="flex h-1.5 gap-0.5">
                      {taskCount > 0 && (
                        <span
                          className={cn(
                            'size-1.5 rounded-full',
                            day === selectedDate ? 'bg-white' : 'bg-brand-500',
                          )}
                        />
                      )}
                      {reminderCount > 0 && (
                        <span
                          className={cn(
                            'size-1.5 rounded-full',
                            day === selectedDate ? 'bg-amber-200' : 'bg-amber-500',
                          )}
                        />
                      )}
                    </span>
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <p className="flex gap-4 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-full bg-brand-500" />{' '}
          {t('search.tasks')}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-full bg-amber-500" />{' '}
          {t('search.reminders')}
        </span>
      </p>

      <section aria-labelledby="day-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="day-heading" className="text-lg font-semibold first-letter:uppercase">
            {formatDayHeading(selectedDate, today)}
          </h2>
          <Button
            size="sm"
            onClick={() => {
              onCreateTask(selectedDate)
            }}
          >
            <PlusIcon className="size-4" />
            {t('task.add')}
          </Button>
        </div>

        {dayTasks.length === 0 && dayReminders.length === 0 && (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('calendar.empty')}</p>
        )}
        {dayTasks.length > 0 && (
          <TaskSection title={t('search.tasks')} tasks={dayTasks} today={today} {...actions} />
        )}
        {dayReminders.length > 0 && (
          <ReminderSection
            title={t('search.reminders')}
            occurrences={dayReminders}
            onEdit={onEditReminder}
          />
        )}
      </section>
    </div>
  )
}
