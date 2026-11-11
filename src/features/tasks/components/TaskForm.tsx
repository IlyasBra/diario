import { type ReactNode, type SubmitEvent, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { inputClassName } from '@/components/ui/styles'
import { tagDisplayName } from '@/features/tags/names'
import { useTags } from '@/features/tags/state/useTags'
import { useI18n } from '@/i18n'
import { addDaysToISODate, type ISODate } from '@/lib/dates'

import { NOTE_MAX_LENGTH, TITLE_MAX_LENGTH, validateTaskInput } from '../model'
import { type TaskInput } from '../types'
import { PriorityPicker } from './PriorityPicker'
import { RepeatField } from './RepeatField'
import { SubtasksField } from './SubtasksField'

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
  const { t } = useI18n()
  const { tags } = useTags()
  const [values, setValues] = useState<TaskInput>(initialValues)
  const [showErrors, setShowErrors] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const timeRef = useRef<HTMLInputElement>(null)
  const ids = {
    title: useId(),
    titleError: useId(),
    note: useId(),
    date: useId(),
    dateError: useId(),
    time: useId(),
    timeError: useId(),
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

    if (validation.title ?? validation.date ?? validation.time ?? validation.repeat) {
      setShowErrors(true)
      // Move focus to the first invalid field so screen readers announce it.
      const firstInvalid = validation.title ? titleRef : validation.date ? dateRef : timeRef
      if (validation.title ?? validation.date ?? validation.time) firstInvalid.current?.focus()
      return
    }

    setIsSaving(true)
    const saved = await onSubmit(values)
    // On success the parent unmounts the form; only reset when it stays open.
    if (!saved) setIsSaving(false)
  }

  return (
    <form noValidate onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <Field
        label={t('form.title')}
        htmlFor={ids.title}
        errorId={ids.titleError}
        error={errors.title}
      >
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
          placeholder={t('form.taskPlaceholder')}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? ids.titleError : undefined}
          className={inputClassName}
        />
      </Field>

      <Field label={t('form.note')} htmlFor={ids.note} errorId={`${ids.note}-error`}>
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

      <Field
        label={values.repeat.kind === 'none' ? t('form.date') : t('form.startsOn')}
        htmlFor={ids.date}
        errorId={ids.dateError}
        error={errors.date}
      >
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
            {t('day.today')}
          </Button>
          <Button
            size="md"
            onClick={() => {
              update('date', tomorrow)
            }}
            aria-pressed={values.date === tomorrow}
            className="aria-pressed:bg-brand-50 aria-pressed:ring-brand-500 dark:aria-pressed:bg-slate-700"
          >
            {t('day.tomorrow')}
          </Button>
        </div>
      </Field>

      <Field
        label={t('form.timeOptional')}
        htmlFor={ids.time}
        errorId={ids.timeError}
        error={errors.time}
      >
        <div className="flex gap-2">
          <input
            ref={timeRef}
            id={ids.time}
            type="time"
            value={values.time ?? ''}
            onChange={(event) => {
              update('time', event.target.value === '' ? null : event.target.value)
            }}
            aria-invalid={errors.time ? true : undefined}
            aria-describedby={errors.time ? ids.timeError : undefined}
            className={`${inputClassName} min-w-0 flex-1`}
          />
          {values.time !== null && (
            <Button
              onClick={() => {
                update('time', null)
              }}
            >
              {t('form.noTime')}
            </Button>
          )}
        </div>
      </Field>

      <RepeatField
        value={values.repeat}
        startDate={values.date}
        error={errors.repeat}
        onChange={(repeat) => {
          update('repeat', repeat)
        }}
      />

      {values.repeat.kind === 'none' && (
        <SubtasksField
          value={values.subtasks}
          onChange={(subtasks) => {
            update('subtasks', subtasks)
          }}
        />
      )}

      <PriorityPicker
        value={values.priority}
        onChange={(priority) => {
          update('priority', priority)
        }}
      />

      <Field label={t('form.tag')} htmlFor={ids.tag} errorId={`${ids.tag}-error`}>
        <select
          id={ids.tag}
          value={values.tag}
          onChange={(event) => {
            update('tag', event.target.value)
          }}
          className={inputClassName}
        >
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tagDisplayName(tag)}
            </option>
          ))}
          {/* Keeps the value valid if the task's tag was deleted. */}
          {!tags.some((tag) => tag.id === values.tag) && (
            <option value={values.tag}>{t('form.noTag')}</option>
          )}
        </select>
      </Field>

      <div className="flex items-center gap-2 pt-2">
        {secondaryAction}
        <div className="ml-auto flex gap-2">
          <Button onClick={onCancel}>{t('common.cancel')}</Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
