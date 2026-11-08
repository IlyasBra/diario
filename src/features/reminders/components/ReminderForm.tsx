import { type ReactNode, type SubmitEvent, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { type SegmentedOption, SegmentedControl } from '@/components/ui/SegmentedControl'
import { inputClassName } from '@/components/ui/styles'

import { REPEAT_LABELS } from '../labels'
import { NOTE_MAX_LENGTH, TITLE_MAX_LENGTH, validateReminderInput } from '../model'
import { REPEATS, type Repeat, type ReminderInput } from '../types'

const REPEAT_OPTIONS: SegmentedOption<Repeat>[] = REPEATS.map((repeat) => ({
  value: repeat,
  label: repeat === 'none' ? 'No' : REPEAT_LABELS[repeat],
}))

interface ReminderFormProps {
  initialValues: ReminderInput
  submitLabel: string
  autoFocusTitle?: boolean
  onSubmit: (input: ReminderInput) => Promise<boolean>
  onCancel: () => void
  secondaryAction?: ReactNode
}

export function ReminderForm({
  initialValues,
  submitLabel,
  autoFocusTitle = false,
  onSubmit,
  onCancel,
  secondaryAction,
}: ReminderFormProps) {
  const [values, setValues] = useState<ReminderInput>(initialValues)
  const [showErrors, setShowErrors] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const timeRef = useRef<HTMLInputElement>(null)
  const ids = {
    title: useId(),
    titleError: useId(),
    date: useId(),
    dateError: useId(),
    time: useId(),
    timeError: useId(),
    note: useId(),
  }

  const errors = showErrors ? validateReminderInput(values) : {}

  function update<K extends keyof ReminderInput>(key: K, value: ReminderInput[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = validateReminderInput(values)
    if (validation.title ?? validation.date ?? validation.time) {
      setShowErrors(true)
      // Move focus to the first invalid field so screen readers announce it.
      const firstInvalid = validation.title ? titleRef : validation.date ? dateRef : timeRef
      firstInvalid.current?.focus()
      return
    }

    setIsSaving(true)
    const saved = await onSubmit(values)
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
          // eslint-disable-next-line jsx-a11y/no-autofocus -- first field of a new item in a modal
          autoFocus={autoFocusTitle}
          autoComplete="off"
          enterKeyHint="done"
          placeholder="ITV, renovar DNI, cumpleaños…"
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? ids.titleError : undefined}
          className={inputClassName}
        />
      </Field>

      <div className="grid grid-cols-[3fr_2fr] gap-3">
        <Field label="Fecha" htmlFor={ids.date} errorId={ids.dateError} error={errors.date}>
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
            className={inputClassName}
          />
        </Field>
        <Field label="Hora" htmlFor={ids.time} errorId={ids.timeError} error={errors.time}>
          <input
            ref={timeRef}
            id={ids.time}
            type="time"
            value={values.time}
            onChange={(event) => {
              update('time', event.target.value)
            }}
            required
            aria-invalid={errors.time ? true : undefined}
            aria-describedby={errors.time ? ids.timeError : undefined}
            className={inputClassName}
          />
        </Field>
      </div>

      <SegmentedControl
        legend="Repetir"
        options={REPEAT_OPTIONS}
        value={values.repeat}
        onChange={(repeat) => {
          update('repeat', repeat)
        }}
      />

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
