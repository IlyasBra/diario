import { type SubmitEvent, useId, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { inputClassName } from '@/components/ui/styles'
import { useI18n } from '@/i18n'

import { looksLikeApiKey } from '../apiKey'

interface ApiKeySetupProps {
  onSave: (key: string) => void
}

/** Asks for the user's own API key. It is stored on this device only. */
export function ApiKeySetup({ onSave }: ApiKeySetupProps) {
  const { t } = useI18n()
  const [value, setValue] = useState('')
  const [invalid, setInvalid] = useState(false)
  const inputId = useId()
  const errorId = useId()

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!looksLikeApiKey(value)) {
      setInvalid(true)
      return
    }
    onSave(value.trim())
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl p-4 ring-1 ring-slate-200 dark:ring-slate-800"
    >
      <h2 className="text-lg font-semibold">{t('assistant.setupTitle')}</h2>
      <p className="text-sm text-slate-700 dark:text-slate-300">{t('assistant.setupBody')}</p>
      <div>
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
          {t('assistant.keyLabel')}
        </label>
        <input
          id={inputId}
          type="password"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setInvalid(false)
          }}
          aria-invalid={invalid ? true : undefined}
          aria-describedby={invalid ? errorId : undefined}
          placeholder="sk-ant-…"
          className={inputClassName}
        />
        {invalid && (
          <p id={errorId} className="mt-1.5 text-sm text-red-700 dark:text-red-400">
            {t('assistant.keyInvalid')}
          </p>
        )}
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
          {t('assistant.keyHelp')}
        </p>
      </div>
      <Button type="submit" variant="primary">
        {t('assistant.keySave')}
      </Button>
    </form>
  )
}
