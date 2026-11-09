import { type SubmitEvent, useId, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { inputClassName } from '@/components/ui/styles'
import { cn } from '@/lib/cn'

import { TAG_COLOR_CLASSES, TAG_COLOR_LABELS } from '../colors'
import { TAG_NAME_MAX_LENGTH, validateTagInput } from '../model'
import { type Tag, type TagColor, type TagInput, TAG_COLORS } from '../types'

interface TagFormProps {
  initialValues: TagInput
  /** The other tags, to reject duplicated names. */
  otherTags: readonly Tag[]
  submitLabel: string
  /** Resolves to true when saved. */
  onSubmit: (input: TagInput) => Promise<boolean>
  onCancel?: () => void
}

export function TagForm({
  initialValues,
  otherTags,
  submitLabel,
  onSubmit,
  onCancel,
}: TagFormProps) {
  const [name, setName] = useState(initialValues.name)
  const [color, setColor] = useState<TagColor>(initialValues.color)
  const [showErrors, setShowErrors] = useState(false)
  const nameId = useId()
  const errorId = useId()
  const colorGroup = useId()

  const errors = showErrors ? validateTagInput({ name, color }, otherTags) : {}

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (validateTagInput({ name, color }, otherTags).name) {
      setShowErrors(true)
      return
    }
    const saved = await onSubmit({ name, color })
    if (saved && onCancel === undefined) {
      // Creation form: stay open for the next tag.
      setName('')
      setShowErrors(false)
    }
  }

  return (
    <form noValidate onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
      <Field label="Nombre" htmlFor={nameId} errorId={errorId} error={errors.name}>
        <input
          id={nameId}
          type="text"
          value={name}
          maxLength={TAG_NAME_MAX_LENGTH}
          onChange={(event) => {
            setName(event.target.value)
          }}
          autoComplete="off"
          enterKeyHint="done"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? errorId : undefined}
          className={inputClassName}
        />
      </Field>

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium">Color</legend>
        <div className="flex flex-wrap gap-2">
          {TAG_COLORS.map((option) => (
            <label key={option} className="relative">
              <input
                type="radio"
                name={colorGroup}
                value={option}
                checked={color === option}
                onChange={() => {
                  setColor(option)
                }}
                className="peer sr-only"
              />
              <span className="sr-only">{TAG_COLOR_LABELS[option]}</span>
              <span
                aria-hidden="true"
                className="flex size-11 cursor-pointer items-center justify-center rounded-full ring-2 ring-transparent peer-checked:ring-slate-900 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500 dark:peer-checked:ring-white"
              >
                <span className={cn('size-7 rounded-full', TAG_COLOR_CLASSES[option].swatch)} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-2">
        <Button type="submit" variant="primary">
          {submitLabel}
        </Button>
        {onCancel && <Button onClick={onCancel}>Cancelar</Button>}
      </div>
    </form>
  )
}
