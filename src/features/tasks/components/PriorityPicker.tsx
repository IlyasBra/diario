import { useId } from 'react'

import { cn } from '@/lib/cn'

import { PRIORITY_LABELS } from '../labels'
import { PRIORITIES, type Priority } from '../types'

const SELECTED_CLASSES: Record<Priority, string> = {
  high: 'peer-checked:bg-red-600 peer-checked:text-white',
  medium: 'peer-checked:bg-amber-500 peer-checked:text-slate-950',
  low: 'peer-checked:bg-sky-600 peer-checked:text-white',
}

interface PriorityPickerProps {
  value: Priority
  onChange: (value: Priority) => void
}

/** Segmented control built from real radio buttons (arrow keys work). */
export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  const name = useId()

  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium">Prioridad</legend>
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        {PRIORITIES.map((priority) => (
          <label key={priority} className="relative">
            <input
              type="radio"
              name={name}
              value={priority}
              checked={value === priority}
              onChange={() => {
                onChange(priority)
              }}
              className="peer sr-only"
            />
            <span
              className={cn(
                'flex h-10 cursor-pointer items-center justify-center rounded-md text-sm font-medium text-slate-700 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500 dark:text-slate-300',
                SELECTED_CLASSES[priority],
              )}
            >
              {PRIORITY_LABELS[priority]}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
