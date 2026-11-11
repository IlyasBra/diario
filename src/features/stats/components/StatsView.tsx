import { EmptyState } from '@/components/ui/EmptyState'
import { TagBadge } from '@/features/tags/components/TagBadge'
import { useTasks } from '@/features/tasks/state/useTasks'
import { useI18n } from '@/i18n'
import { formatShortDate, formatWeekday, type ISODate, parseISODate } from '@/lib/dates'

import {
  bestStreak,
  completionsByDay,
  completionsByTag,
  currentStreak,
  lastDays,
  startOfWeekISO,
  totalBetween,
} from '../stats'

interface StatsViewProps {
  today: ISODate
}

export function StatsView({ today }: StatsViewProps) {
  const { t, tn } = useI18n()
  const { tasks } = useTasks()
  const counts = completionsByDay(tasks)

  if (counts.size === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t('stats.title')}</h1>
        <EmptyState title={t('stats.emptyTitle')} description={t('stats.emptyDescription')} />
      </div>
    )
  }

  const streak = currentStreak(counts, today)
  const week = lastDays(counts, today, 7)
  const maxCount = Math.max(1, ...week.map((day) => day.count))
  const monday = startOfWeekISO(today)
  const monthAgo = lastDays(counts, today, 30)[0]?.date ?? today
  const byTag = completionsByTag(tasks, monthAgo, today)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('stats.title')}</h1>

      <dl className="grid grid-cols-2 gap-3">
        <Stat label={t('stats.streak')} value={tn('count.days', streak)} />
        <Stat label={t('stats.bestStreak')} value={tn('count.days', bestStreak(counts))} />
        <Stat label={t('stats.thisWeek')} value={String(totalBetween(counts, monday, today))} />
        <Stat label={t('stats.last30')} value={String(totalBetween(counts, monthAgo, today))} />
      </dl>

      <section aria-labelledby="week-heading">
        <h2
          id="week-heading"
          className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400"
        >
          {t('stats.weekHeading')}
        </h2>
        <ul className="flex h-40 items-end gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          {week.map((day) => (
            <li
              key={day.date}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
            >
              <span className="text-xs font-semibold tabular-nums">{day.count}</span>
              <span
                aria-hidden="true"
                style={{ height: `${String(Math.max(4, (day.count / maxCount) * 100))}%` }}
                className="w-full max-w-8 rounded-t-md bg-brand-500 data-[empty=true]:bg-slate-200 dark:data-[empty=true]:bg-slate-700"
                data-empty={day.count === 0}
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                <span className="sr-only">{formatShortDate(day.date)}: </span>
                <span aria-hidden="true" className="first-letter:uppercase">
                  {formatWeekday(parseISODate(day.date), 'narrow')}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {byTag.length > 0 && (
        <section aria-labelledby="tags-stats-heading">
          <h2
            id="tags-stats-heading"
            className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-400"
          >
            {t('stats.byTag')}
          </h2>
          <ul className="space-y-2">
            {byTag.map(({ tagId, count }) => (
              <li
                key={tagId}
                className="flex items-center justify-between rounded-xl bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
              >
                <TagBadge tagId={tagId} />
                <span className="font-semibold tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <dt className="text-sm text-slate-600 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight">{value}</dd>
    </div>
  )
}
