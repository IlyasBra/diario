import { type ReactNode, type SubmitEvent, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { inputClassName } from '@/components/ui/styles'
import { addDaysToISODate, type ISODate } from '@/lib/dates'

import { TAG_LABELS } from '../labels'
import { NOTE_MAX_LENGTH, TITLE_MAX_LENGTH, validateTaskInput } from '../model'
import { TAGS, type Tag, type TaskInput } from '../types'
import { PriorityPicker } from './PriorityPicker'

interface TaskFormProps {
  initialValues: TaskInput
  today: ISODate
  submitLabel: string
  /** Focus the title when the form opens (only when creating). */
  autoFocusTitle?: boolean
  /** Resolves to true when saved; the form stays open otherwise. */
  onSubmit: (input: TaskInput) => Promise<boolean>
  onCancel: () => void
  /** Extra action on the left of the footer, e.g. "Eliminar". */
  secondaryAction?: ReactNode
}

export function TaskForm({
  initialValues,
  today,
  submitLabel,
  autoFocusTitle = false,
  onSubmit,
  onCancel,
  secondaryAction,
}: TaskFormProps) {
  const [values, setValues] = useState<TaskInput>(initialValues)
  const [showErrors, setShowErrors] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const ids = {
    title: useId(),
    titleError: useId(),
    note: useId(),
    date: useId(),
    dateError: useId(),
    tag: useId(),
  }

  const errors = showErrors ? validateTaskInput(values) : {}
  const tomorrow = addDaysToISODate(today, 1)

  function update<K extends keyof TaskInput>(key: K, value: TaskInput[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = validateTaskInput(values)

    if (validation.title ?? validation.date) {
      setShowErrors(true)
      // Move focus to the first invalid field so screen readers announce it.
      ;(validation.title ? titleRef : dateRef).current?.focus()
      return
    }

    setIsSaving(true)
    const saved = await onSubmit(values)
    // On success the parent unmounts the form; only reset when it stays open.
    if (!saved) setIsSaving(false)
  }

  return (
    <form noValidate onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <Field label="Título" htmlFor={ids.title} errorId={ids.titleError} error={errors.title}>
        <input
          ref={titleRef}
          id={ids.title}
          type="text"
          value={values.title}
          onChange={(event) => {
            update('title', event.target.value)
          }}
          maxLength={TITLE_MAX_LENGTH}
          required
          // Native <dialog> moves focus to its first control; for a new task
          // that should be the title. MDN recommends autofocus for this case.
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocusTitle}
          autoComplete="off"
          enterKeyHint="done"
          placeholder="¿Qué tienes que hacer?"
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? ids.titleError : undefined}
          className={inputClassName}
        />
      </Field>

      <Field label="Nota (opcional)" htmlFor={ids.note} errorId={`${ids.note}-error`}>
        <textarea
          id={ids.note}
          value={values.note}
          onChange={(event) => {
            update('note', event.target.value)
          }}
          maxLength={NOTE_MAX_LENGTH}
          rows={2}
          className={inputClassName}
        />
      </Field>

      <Field label="Fecha" htmlFor={ids.date} errorId={ids.dateError} error={errors.date}>
        <div className="flex gap-2">
          <input
            ref={dateRef}
            id={ids.date}
            type="date"
            value={values.date}
            onChange={(event) => {
              update('date', event.target.value)
            }}
            required
            aria-invalid={errors.date ? true : undefined}
            aria-describedby={errors.date ? ids.dateError : undefined}
            className={`${inputClassName} min-w-0 flex-1`}
          />
          <Button
            size="md"
            onClick={() => {
              update('date', today)
            }}
            aria-pressed={values.date === today}
            className="aria-pressed:bg-brand-50 aria-pressed:ring-brand-500 dark:aria-pressed:bg-slate-700"
          >
            Hoy
          </Button>
          <Button
            size="md"
            onClick={() => {
              update('date', tomorrow)
            }}
            aria-pressed={values.date === tomorrow}
            className="aria-pressed:bg-brand-50 aria-pressed:ring-brand-500 dark:aria-pressed:bg-slate-700"
          >
            Mañana
          </Button>
        </div>
      </Field>

      <PriorityPicker
        value={values.priority}
        onChange={(priority) => {
          update('priority', priority)
        }}
      />

      <Field label="Etiqueta" htmlFor={ids.tag} errorId={`${ids.tag}-error`}>
        <select
          id={ids.tag}
          value={values.tag}
          onChange={(event) => {
            update('tag', event.target.value as Tag)
          }}
          className={inputClassName}
        >
          {TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {TAG_LABELS[tag]}
            </option>
          ))}
        </select>
      </Field>

      <div className="flex items-center gap-2 pt-2">
        {secondaryAction}
        <div className="ml-auto flex gap-2">
          <Button onClick={onCancel}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
