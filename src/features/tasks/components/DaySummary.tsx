import { pluralize } from '@/lib/text'

import { type DaySummary as DaySummaryData } from '../selectors'

interface DaySummaryProps {
  summary: DaySummaryData
}

export function DaySummary({ summary }: DaySummaryProps) {
  const { total, completed, overdue } = summary
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="rounded-2xl bg-brand-600 p-4 text-white shadow-sm">
      <p className="text-lg font-medium" aria-live="polite">
        {total === 0
          ? 'No tienes tareas para hoy.'
          : `Hoy tienes ${pluralize(total, 'tarea', 'tareas')}, ${pluralize(completed, 'completada', 'completadas')}.`}
      </p>
      {overdue > 0 && (
        <p className="mt-0.5 text-sm text-brand-100">
          Y {pluralize(overdue, 'tarea atrasada', 'tareas atrasadas')} de días anteriores.
        </p>
      )}
      {total > 0 && (
        <div
          role="progressbar"
          aria-label="Progreso de hoy"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="mt-3 h-2 overflow-hidden rounded-full bg-white/25"
        >
          <div
            className="h-full rounded-full bg-white transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
