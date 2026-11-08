import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { BellIcon } from '@/components/ui/icons'
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
  const { support, requestPermission } = useNotificationSupport()
  const [dismissed, setDismissed] = useState(() => readLocal(DISMISSED_KEY, false))
  const [testResult, setTestResult] = useState<string | null>(null)

  if (support === 'default' && !dismissed) {
    return (
      <div className="rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100 dark:bg-slate-900 dark:ring-slate-700">
        <div className="flex gap-3">
          <BellIcon className="mt-0.5 size-6 shrink-0 text-brand-600 dark:text-brand-400" />
          <div>
            <p className="font-medium">¿Te aviso a la hora?</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              Te enviaré una notificación cuando llegue la hora de un recordatorio o de una tarea
              con hora.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={() => void requestPermission()}>
                Activar avisos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  writeLocal(DISMISSED_KEY, true)
                  setDismissed(true)
                }}
              >
                Ahora no
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const message = MESSAGES[support]
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
                body: 'Así te llegarán los avisos.',
                at: new Date(),
              }).then((shown) => {
                setTestResult(shown ? null : 'El sistema no ha mostrado el aviso de prueba.')
              })
            }}
          >
            Enviar aviso de prueba
          </Button>
          {testResult && <span role="status">{testResult}</span>}
        </div>
      )}
    </div>
  )
}

const MESSAGES: Record<ReturnType<typeof useNotificationSupport>['support'], string | null> = {
  default: null,
  granted:
    'Avisos activados. Sin servidor, llegan mientras Diario está abierta o en segundo plano; si estaba cerrada, verás los avisos pendientes al abrirla.',
  denied:
    'Has bloqueado los avisos. Puedes activarlos en los ajustes del navegador o, en el iPhone, en Ajustes › Notificaciones › Diario. Mientras tanto te avisaré dentro de la app.',
  'install-required':
    'Para recibir avisos en el iPhone, añade Diario a la pantalla de inicio (Compartir › Añadir a pantalla de inicio) y ábrela desde su icono. Mientras tanto te avisaré dentro de la app.',
  unsupported: 'Este navegador no permite notificaciones; te avisaré dentro de la app.',
}
