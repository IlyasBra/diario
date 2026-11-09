import { type ChangeEvent, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import { useReminders } from '@/features/reminders/state/useReminders'
import { useTasks } from '@/features/tasks/state/useTasks'
import { downloadTextFile } from '@/lib/download'
import { pluralize } from '@/lib/text'

import {
  type BackupFile,
  backupFileName,
  createBackup,
  parseBackup,
} from '@/features/backup/backup'

interface BackupSectionProps {
  /** Whether the browser promised not to evict the data (null = unknown). */
  isStoragePersistent: boolean | null
}

interface Feedback {
  tone: 'done' | 'error'
  message: string
}

/** Export/import of all data as a JSON file: the user's own safety net. */
export function BackupSection({ isStoragePersistent }: BackupSectionProps) {
  const { tasks, replaceTasks } = useTasks()
  const { reminders, replaceReminders } = useReminders()
  const [pending, setPending] = useState<BackupFile | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const exportBackup = () => {
    const now = new Date()
    const backup = createBackup(tasks, reminders, now)
    downloadTextFile(backupFileName(now), JSON.stringify(backup, null, 2), 'application/json')
    setFeedback({ tone: 'done', message: 'Copia guardada. Consérvala en un lugar seguro.' })
  }

  const chooseFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = '' // allows choosing the same file again
    if (!file) return

    setFeedback(null)
    setPending(null)
    const result = parseBackup(await file.text())
    if (result.ok) setPending(result.backup)
    else setFeedback({ tone: 'error', message: result.error })
  }

  const restore = async () => {
    if (!pending) return
    // Tasks first: if it fails nothing has been replaced yet.
    const tasksDone = await replaceTasks(pending.tasks)
    const remindersDone = tasksDone && (await replaceReminders(pending.reminders))
    if (remindersDone) {
      setPending(null)
      setFeedback({ tone: 'done', message: 'Copia restaurada.' })
    } else {
      setFeedback({ tone: 'error', message: 'No se ha podido restaurar la copia.' })
    }
  }

  return (
    <section aria-labelledby="backup-heading" className="space-y-4">
      <h3 id="backup-heading" className="text-base font-semibold">
        Copia de seguridad
      </h3>
      <div className="space-y-6">
        <section className="space-y-2">
          <h4 className="font-medium">Guardar copia</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Descarga un archivo con tus {pluralize(tasks.length, 'tarea', 'tareas')} y{' '}
            {pluralize(reminders.length, 'recordatorio', 'recordatorios')}. Hazlo de vez en cuando:
            es la forma de no perder nada si cambias de móvil o borras los datos del navegador.
          </p>
          <Button variant="primary" onClick={exportBackup}>
            Guardar copia
          </Button>
        </section>

        <section className="space-y-2">
          <h4 className="font-medium">Restaurar copia</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Elige un archivo guardado antes. Sustituirá lo que hay ahora en la app.
          </p>
          <label className="inline-flex h-11 cursor-pointer items-center rounded-lg bg-white px-4 font-medium text-slate-800 ring-1 ring-slate-300 focus-within:ring-2 focus-within:ring-brand-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600 dark:hover:bg-slate-700">
            Elegir archivo
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => void chooseFile(event)}
            />
          </label>

          {pending && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-sm">
                La copia tiene {pluralize(pending.tasks.length, 'tarea', 'tareas')} y{' '}
                {pluralize(pending.reminders.length, 'recordatorio', 'recordatorios')}. Esto
                reemplazará tus {pluralize(tasks.length, 'tarea', 'tareas')} y{' '}
                {pluralize(reminders.length, 'recordatorio', 'recordatorios')} actuales.
              </p>
              <div className="flex gap-2">
                <Button variant="danger" onClick={() => void restore()}>
                  Reemplazar datos
                </Button>
                <Button
                  onClick={() => {
                    setPending(null)
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </section>

        {feedback?.tone === 'done' && (
          <p role="status" className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {feedback.message}
          </p>
        )}
        {feedback?.tone === 'error' && <Notice tone="error">{feedback.message}</Notice>}

        <p className="text-sm text-slate-600 dark:text-slate-400">
          {isStoragePersistent === true
            ? 'Almacenamiento protegido: el navegador no borrará tus datos por falta de espacio.'
            : 'El navegador podría borrar los datos si falta espacio. Instala la app en la pantalla de inicio y guarda copias.'}
        </p>
      </div>
    </section>
  )
}
