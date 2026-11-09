import { useId } from 'react'

import { SegmentedControl, type SegmentedOption } from '@/components/ui/SegmentedControl'
import { cn } from '@/lib/cn'
import { type ISODate } from '@/lib/dates'

import { weekdayIndex, WEEKDAY_INITIALS, WEEKDAY_LABELS, WEEKDAYS } from '../recurrence'
import { type TaskRepeat, type WeekdayIndex } from '../types'

const OPTIONS: SegmentedOption<TaskRepeat['kind']>[] = [
  { value: 'none', label: 'No' },
  { value: 'daily', label: 'Cada día' },
  { value: 'weekly', label: 'Cada semana' },
  { value: 'monthly', label: 'Cada mes' },
]

interface RepeatFieldProps {
  value: TaskRepeat
  /** Start date: a new weekly rule begins with its weekday selected. */
  startDate: ISODate
  error?: string | undefined
  onChange: (repeat: TaskRepeat) => void
}

export function RepeatField({ value, startDate, error, onChange }: RepeatFieldProps) {
  const errorId = useId()

  function changeKind(kind: TaskRepeat['kind']) {
    if (kind === 'weekly') {
      const days = value.kind === 'weekly' ? value.days : [safeWeekday(startDate)]
      onChange({ kind, days })
    } else {
      onChange({ kind })
    }
  }

  function toggleDay(day: WeekdayIndex) {
    if (value.kind !== 'weekly') return
    const days = value.days.includes(day)
      ? value.days.filter((current) => current !== day)
      : [...value.days, day].sort()
    onChange({ kind: 'weekly', days })
  }

  return (
    <div className="space-y-3">
      <SegmentedControl
        legend="Se repite"
        options={OPTIONS}
        value={value.kind}
        onChange={changeKind}
      />

      {value.kind === 'weekly' && (
        <fieldset aria-describedby={error ? errorId : undefined}>
          <legend className="mb-1.5 block text-sm font-medium">Días de la semana</legend>
          <div className="flex gap-1.5">
            {WEEKDAYS.map((day) => (
              <label key={day} className="relative flex-1">
                <input
                  type="checkbox"
                  checked={value.days.includes(day)}
                  onChange={() => {
                    toggleDay(day)
                  }}
                  className="peer sr-only"
                />
                <span className="sr-only">{WEEKDAY_LABELS[day]}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-11 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 peer-checked:bg-brand-600 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500 dark:bg-slate-800 dark:text-slate-300',
                  )}
                >
                  {WEEKDAY_INITIALS[day]}
                </span>
              </label>
            ))}
          </div>
          {error && (
            <p id={errorId} className="mt-1.5 text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          )}
        </fieldset>
      )}
    </div>
  )
}

function safeWeekday(date: ISODate): WeekdayIndex {
  try {
    return weekdayIndex(date)
  } catch {
    return 0 // invalid date typed in the form: any day will do until it is fixed
  }
}
