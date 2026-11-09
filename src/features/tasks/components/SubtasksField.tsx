import { useRef } from 'react'

import { Button } from '@/components/ui/Button'
import { PlusIcon, TrashIcon } from '@/components/ui/icons'
import { inputClassName } from '@/components/ui/styles'

import { newSubtask } from '../model'
import { type Subtask } from '../types'

interface SubtasksFieldProps {
  value: Subtask[]
  onChange: (subtasks: Subtask[]) => void
}

/** Editable checklist. Empty items are dropped when the task is saved. */
export function SubtasksField({ value, onChange }: SubtasksFieldProps) {
  const lastInputRef = useRef<HTMLInputElement>(null)

  function update(id: string, title: string) {
    onChange(value.map((subtask) => (subtask.id === id ? { ...subtask, title } : subtask)))
  }

  function add() {
    onChange([...value, newSubtask()])
    // Wait for the new input to render before focusing it.
    setTimeout(() => lastInputRef.current?.focus(), 0)
  }

  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium">Subtareas (opcional)</legend>
      <ul className="space-y-2">
        {value.map((subtask, index) => (
          <li key={subtask.id} className="flex gap-2">
            <input
              ref={index === value.length - 1 ? lastInputRef : undefined}
              type="text"
              value={subtask.title}
              onChange={(event) => {
                update(subtask.id, event.target.value)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  add()
                }
              }}
              aria-label={`Subtarea ${String(index + 1)}`}
              maxLength={120}
              autoComplete="off"
              enterKeyHint="next"
              className={`${inputClassName} min-w-0 flex-1`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onChange(value.filter((current) => current.id !== subtask.id))
              }}
            >
              <TrashIcon />
              <span className="sr-only">Quitar subtarea {index + 1}</span>
            </Button>
          </li>
        ))}
      </ul>
      <Button size="sm" onClick={add} className="mt-2">
        <PlusIcon className="size-4" />
        Añadir subtarea
      </Button>
    </fieldset>
  )
}
