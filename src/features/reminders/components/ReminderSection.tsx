import { useId } from 'react'

import { type ReminderOccurrence } from '../selectors'
import { type Reminder } from '../types'
import { ReminderItem } from './ReminderItem'

interface ReminderSectionProps {
  title: string
  occurrences: ReminderOccurrence[]
  isPast?: boolean
  onEdit: (reminder: Reminder) => void
}

export function ReminderSection({ title, occurrences, isPast, onEdit }: ReminderSectionProps) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="mb-2 text-sm font-semibold text-slate-600 first-letter:uppercase dark:text-slate-400"
      >
        {title}
      </h2>
      <ul className="space-y-2">
        {occurrences.map((occurrence) => (
          <ReminderItem
            key={`${occurrence.reminder.id}@${occurrence.at.toISOString()}`}
            occurrence={occurrence}
            isPast={isPast ?? false}
            onEdit={onEdit}
          />
        ))}
      </ul>
    </section>
  )
}
