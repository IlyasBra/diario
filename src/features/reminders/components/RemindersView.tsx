import { type ReactNode, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon } from '@/components/ui/icons'
import { type SegmentedOption, SegmentedControl } from '@/components/ui/SegmentedControl'
import { useNow } from '@/hooks/useNow'
import { type MessageKey, useI18n } from '@/i18n'
import { formatDayHeading, toISODate } from '@/lib/dates'

import {
  getRangeBounds,
  groupByDay,
  type ReminderOccurrence,
  type ReminderRange,
  selectAllReminders,
  selectOccurrencesBetween,
} from '../selectors'
import { useReminders } from '../state/useReminders'
import { type Reminder } from '../types'
import { ReminderSection } from './ReminderSection'

const EMPTY_KEYS: Record<ReminderRange, MessageKey> = {
  week: 'reminders.emptyWeek',
  month: 'reminders.emptyMonth',
  all: 'reminders.emptyAll',
}

interface RemindersViewProps {
  onCreate: () => void
  onEdit: (reminder: Reminder) => void
  /** Slot above the list, e.g. the notifications prompt. */
  banner?: ReactNode
}

export function RemindersView({ onCreate, onEdit, banner }: RemindersViewProps) {
  const { t } = useI18n()
  const rangeOptions: SegmentedOption<ReminderRange>[] = [
    { value: 'week', label: t('reminders.week') },
    { value: 'month', label: t('reminders.month') },
    { value: 'all', label: t('reminders.all') },
  ]
  const { reminders } = useReminders()
  const [range, setRange] = useState<ReminderRange>('week')
  const now = useNow()
  const today = toISODate(now)

  let upcoming: ReminderOccurrence[]
  let past: ReminderOccurrence[] = []
  if (range === 'all') {
    ;({ upcoming, past } = selectAllReminders(reminders, now))
  } else {
    const { start, end } = getRangeBounds(range, now)
    upcoming = selectOccurrencesBetween(reminders, start, end)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('reminders.title')}</h1>
      {banner}

      <SegmentedControl
        legend={t('reminders.period')}
        hideLegend
        options={rangeOptions}
        value={range}
        onChange={setRange}
      />

      {upcoming.length === 0 && past.length === 0 ? (
        <EmptyState
          title={t(EMPTY_KEYS[range])}
          description={t('reminders.emptyDescription')}
          action={
            <Button variant="primary" onClick={onCreate}>
              <PlusIcon />
              {t('reminders.add')}
            </Button>
          }
        />
      ) : (
        <>
          {groupByDay(upcoming).map((group) => (
            <ReminderSection
              key={group.date}
              title={formatDayHeading(group.date, today)}
              occurrences={group.occurrences}
              onEdit={onEdit}
            />
          ))}
          {past.length > 0 && (
            <ReminderSection
              title={t('reminders.past')}
              occurrences={past}
              isPast
              onEdit={onEdit}
            />
          )}
        </>
      )}
    </div>
  )
}
