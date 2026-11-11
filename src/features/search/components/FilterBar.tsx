import { useId } from 'react'

import { Button } from '@/components/ui/Button'
import { inputClassName } from '@/components/ui/styles'
import { tagDisplayName } from '@/features/tags/names'
import { useTags } from '@/features/tags/state/useTags'
import { priorityLabel } from '@/features/tasks/labels'
import { PRIORITIES, type Priority } from '@/features/tasks/types'
import { useI18n } from '@/i18n'

import { EMPTY_FILTER, isFilterActive, type TaskFilter } from '../filters'

interface FilterBarProps {
  filter: TaskFilter
  onChange: (filter: TaskFilter) => void
}

/** Two selects (tag, priority) and a button to clear them. */
export function FilterBar({ filter, onChange }: FilterBarProps) {
  const { t } = useI18n()
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
          {t('filters.tag')}
        </label>
        <select
          id={tagId}
          value={filter.tagId ?? ''}
          onChange={(event) => {
            onChange({ ...filter, tagId: event.target.value === '' ? null : event.target.value })
          }}
          className={inputClassName}
        >
          <option value="">{t('filters.all')}</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tagDisplayName(tag)}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-32 flex-1">
        <label
          htmlFor={priorityId}
          className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
        >
          {t('filters.priority')}
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
          <option value="">{t('filters.all')}</option>
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priorityLabel(priority)}
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
          {t('filters.clear')}
        </Button>
      )}
    </div>
  )
}
