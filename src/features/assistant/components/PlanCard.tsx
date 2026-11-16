import { Button } from '@/components/ui/Button'
import { useI18n } from '@/i18n'
import { formatDayHeading, type ISODate } from '@/lib/dates'
import { tagDisplayName } from '@/features/tags/names'
import { useTags } from '@/features/tags/state/useTags'
import { priorityLabel } from '@/features/tasks/labels'

import { type ProposedTask } from '../types'

interface PlanCardProps {
  plan: readonly ProposedTask[]
  today: ISODate
  added: boolean
  busy: boolean
  onAdd: () => void
  onDiscard: () => void
}

/** The tasks the assistant suggests. They are saved only when the user accepts. */
export function PlanCard({ plan, today, added, busy, onAdd, onDiscard }: PlanCardProps) {
  const { t, tn } = useI18n()
  const { tags } = useTags()
  const tagName = (id: string) => {
    const tag = tags.find((item) => item.id === id)
    return tag ? tagDisplayName(tag) : id
  }

  return (
    <section
      aria-label={t('assistant.planTitle')}
      className="mt-3 space-y-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
    >
      <h3 className="text-sm font-semibold">{t('assistant.planTitle')}</h3>
      <ul className="space-y-2">
        {plan.map((task, index) => (
          <li key={`${task.date}-${task.title}-${index}`} className="text-sm">
            <p className="font-medium">{task.title}</p>
            <p className="text-slate-600 dark:text-slate-400">
              {formatDayHeading(task.date, today)}
              {task.time ? ` · ${task.time}` : ''} · {priorityLabel(task.priority)} ·{' '}
              {tagName(task.tag)}
            </p>
          </li>
        ))}
      </ul>
      {added ? (
        <p role="status" className="text-sm font-medium text-green-800 dark:text-green-300">
          {t('assistant.added')}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={onAdd} disabled={busy}>
            {tn('assistant.addAll', plan.length)}
          </Button>
          <Button size="sm" onClick={onDiscard} disabled={busy}>
            {t('assistant.discard')}
          </Button>
        </div>
      )}
    </section>
  )
}
