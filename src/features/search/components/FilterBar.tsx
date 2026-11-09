import { useId } from 'react'

import { Button } from '@/components/ui/Button'
import { inputClassName } from '@/components/ui/styles'
import { useTags } from '@/features/tags/state/useTags'
import { PRIORITY_LABELS } from '@/features/tasks/labels'
import { PRIORITIES, type Priority } from '@/features/tasks/types'

import { EMPTY_FILTER, isFilterActive, type TaskFilter } from '../filters'

interface FilterBarProps {
  filter: TaskFilter
  onChange: (filter: TaskFilter) => void
}

/** Two selects (tag, priority) and a button to clear them. */
export function FilterBar({ filter, onChange }: FilterBarProps) {
  const { tags } = useTags()
  const tagId = useId()
  const priorityId = useId()

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="min-w-32 flex-1">
        <label
          htmlFor={tagId}
          className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
        >
          Etiqueta
        </label>
        <select
          id={tagId}
          value={filter.tagId ?? ''}
          onChange={(event) => {
            onChange({ ...filter, tagId: event.target.value === '' ? null : event.target.value })
          }}
          className={inputClassName}
        >
          <option value="">Todas</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-32 flex-1">
        <label
          htmlFor={priorityId}
          className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
        >
          Prioridad
        </label>
        <select
          id={priorityId}
          value={filter.priority ?? ''}
          onChange={(event) => {
            onChange({
              ...filter,
              priority: event.target.value === '' ? null : (event.target.value as Priority),
            })
          }}
          className={inputClassName}
        >
          <option value="">Todas</option>
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </div>

      {isFilterActive(filter) && (
        <Button
          onClick={() => {
            onChange(EMPTY_FILTER)
          }}
        >
          Quitar filtros
        </Button>
      )}
    </div>
  )
}
