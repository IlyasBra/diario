import { Button } from '@/components/ui/Button'
import { BellIcon } from '@/components/ui/icons'

import { type Alert } from '../alerts'

interface InAppAlertsProps {
  alerts: Alert[]
  onDismiss: (key: string) => void
}

/** Alerts shown inside the app when system notifications are not allowed. */
export function InAppAlerts({ alerts, onDismiss }: InAppAlertsProps) {
  if (alerts.length === 0) return null

  return (
    <div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+4.5rem)] z-40 mx-auto flex max-w-md flex-col gap-2 px-4">
      {alerts.map((alert) => (
        <div
          key={alert.key}
          role="alert"
          className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
        >
          <BellIcon className="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-brand-400" />
          <div className="min-w-0 flex-1">
            <p className="font-medium break-words">{alert.title}</p>
            <p className="text-sm whitespace-pre-line text-slate-600 dark:text-slate-300">
              {alert.body}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              onDismiss(alert.key)
            }}
          >
            Entendido
          </Button>
        </div>
      ))}
    </div>
  )
}
