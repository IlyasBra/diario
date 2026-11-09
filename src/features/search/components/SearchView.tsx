import { useId, useState } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { inputClassName } from '@/components/ui/styles'
import { ReminderSection } from '@/features/reminders/components/ReminderSection'
import { selectAllReminders } from '@/features/reminders/selectors'
import { useReminders } from '@/features/reminders/state/useReminders'
import { type Reminder } from '@/features/reminders/types'
import { useTags } from '@/features/tags/state/useTags'
import { TaskSection } from '@/features/tasks/components/TaskSection'
import { nextOccurrence, projectOccurrence } from '@/features/tasks/recurrence'
import { compareTasks } from '@/features/tasks/selectors'
import { useTaskItemActions } from '@/features/tasks/state/useTaskItemActions'
import { useTasks } from '@/features/tasks/state/useTasks'
import { type Task } from '@/features/tasks/types'
import { useNow } from '@/hooks/useNow'
import { type ISODate } from '@/lib/dates'

import { EMPTY_FILTER, isFilterActive, searchAll, type TaskFilter } from '../filters'
import { FilterBar } from './FilterBar'

interface SearchViewProps {
  today: ISODate
  onEditTask: (task: Task) => void
  onEditReminder: (reminder: Reminder) => void
}

export function SearchView({ today, onEditTask, onEditReminder }: SearchViewProps) {
  const { tasks } = useTasks()
  const { reminders } = useReminders()
  const { tags } = useTags()
  const actions = useTaskItemActions(today, onEditTask)
  const now = useNow()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<TaskFilter>(EMPTY_FILTER)
  const searchId = useId()

  const isSearching = query.trim() !== '' || isFilterActive(filter)
  const results = searchAll(tasks, reminders, tags, query, filter)

  // Repeating tasks are shown on their next occurrence, so the checkbox acts on that day.
  const taskResults = results.tasks
    .map((task) => projectOccurrence(task, nextOccurrence(task, today) ?? task.date))
    .sort((a, b) => a.date.localeCompare(b.date) || compareTasks(a, b))
  const { upcoming, past } = selectAllReminders(results.reminders, now)
  const isEmpty = taskResults.length === 0 && results.reminders.length === 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Buscar</h1>

      <div>
        <label htmlFor={searchId} className="sr-only">
          Buscar en tareas y recordatorios
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
          }}
          placeholder="Buscar en tareas y recordatorios"
          autoComplete="off"
          enterKeyHint="search"
          className={inputClassName}
        />
      </div>

      <FilterBar filter={filter} onChange={setFilter} />

      {!isSearching ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Escribe una palabra o elige una etiqueta o prioridad. Busca en títulos, notas, subtareas y
          etiquetas, sin importar mayúsculas ni tildes.
        </p>
      ) : isEmpty ? (
        <EmptyState
          title="No hay resultados"
          description="Prueba con otra palabra o quita algún filtro."
        />
      ) : (
        <>
          {taskResults.length > 0 && (
            <TaskSection title="Tareas" tasks={taskResults} today={today} {...actions} />
          )}
          {upcoming.length > 0 && (
            <ReminderSection title="Recordatorios" occurrences={upcoming} onEdit={onEditReminder} />
          )}
          {past.length > 0 && (
            <ReminderSection
              title="Recordatorios pasados"
              occurrences={past}
              isPast
              onEdit={onEditReminder}
            />
          )}
        </>
      )}
    </div>
  )
}
