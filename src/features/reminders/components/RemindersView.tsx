import { type ReactNode, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon } from '@/components/ui/icons'
import { type SegmentedOption, SegmentedControl } from '@/components/ui/SegmentedControl'
import { useNow } from '@/hooks/useNow'
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

const RANGE_OPTIONS: SegmentedOption<ReminderRange>[] = [
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'all', label: 'Todos' },
]

const EMPTY_MESSAGES: Record<ReminderRange, string> = {
  week: 'No tienes recordatorios esta semana.',
  month: 'No tienes recordatorios este mes.',
  all: 'Todavía no tienes recordatorios.',
}

interface RemindersViewProps {
  onCreate: () => void
  onEdit: (reminder: Reminder) => void
  /** Slot above the list, e.g. the notifications prompt. */
  banner?: ReactNode
}

export function RemindersView({ onCreate, onEdit, banner }: RemindersViewProps) {
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
      <h1 className="text-2xl font-semibold tracking-tight">Recordatorios</h1>
      {banner}

      <SegmentedControl
        legend="Periodo"
        hideLegend
        options={RANGE_OPTIONS}
        value={range}
        onChange={setRange}
      />

      {upcoming.length === 0 && past.length === 0 ? (
        <EmptyState
          title={EMPTY_MESSAGES[range]}
          description="Apunta la ITV, renovar el DNI, cumpleaños o pagos y te avisaré a la hora indicada."
          action={
            <Button variant="primary" onClick={onCreate}>
              <PlusIcon />
              Añadir recordatorio
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
            <ReminderSection title="Pasados" occurrences={past} isPast onEdit={onEdit} />
          )}
        </>
      )}
    </div>
  )
}
