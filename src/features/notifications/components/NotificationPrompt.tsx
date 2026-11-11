import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { BellIcon } from '@/components/ui/icons'
import { useI18n } from '@/i18n'
import { readLocal, writeLocal } from '@/lib/localStore'

import { showSystemNotification } from '../notifier'
import { useNotificationSupport } from '../useNotificationSupport'

const DISMISSED_KEY = 'diario:notification-prompt-dismissed'

/**
 * Asks for notification permission only after explaining why, and only
 * when the user taps the button (browsers penalise prompts on page load,
 * and iOS requires a user gesture).
 */
export function NotificationPrompt() {
  const { t } = useI18n()
  const { support, requestPermission } = useNotificationSupport()
  const [dismissed, setDismissed] = useState(() => readLocal(DISMISSED_KEY, false))
  const [testResult, setTestResult] = useState<string | null>(null)

  if (support === 'default' && !dismissed) {
    return (
      <div className="rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100 dark:bg-slate-900 dark:ring-slate-700">
        <div className="flex gap-3">
          <BellIcon className="mt-0.5 size-6 shrink-0 text-brand-600 dark:text-brand-400" />
          <div>
            <p className="font-medium">{t('prompt.title')}</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              {t('prompt.description')}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={() => void requestPermission()}>
                {t('prompt.enable')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  writeLocal(DISMISSED_KEY, true)
                  setDismissed(true)
                }}
              >
                {t('prompt.notNow')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const messages: Record<typeof support, string | null> = {
    default: null,
    granted: t('prompt.granted'),
    denied: t('prompt.denied'),
    'install-required': t('prompt.installRequired'),
    unsupported: t('prompt.unsupported'),
  }
  const message = messages[support]
  if (!message || (support === 'default' && dismissed)) return null

  return (
    <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
      <p>{message}</p>
      {support === 'granted' && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Button
            size="sm"
            onClick={() => {
              void showSystemNotification({
                key: `test:${Date.now()}`,
                title: 'Diario',
                body: t('prompt.testBody'),
                at: new Date(),
              }).then((shown) => {
                setTestResult(shown ? null : t('prompt.testFailed'))
              })
            }}
          >
            {t('prompt.test')}
          </Button>
          {testResult && <span role="status">{testResult}</span>}
        </div>
      )}
    </div>
  )
}
