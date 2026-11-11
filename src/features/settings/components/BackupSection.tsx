import { type ChangeEvent, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import { useReminders } from '@/features/reminders/state/useReminders'
import { useTags } from '@/features/tags/state/useTags'
import { useTasks } from '@/features/tasks/state/useTasks'
import { useI18n } from '@/i18n'
import { downloadTextFile } from '@/lib/download'

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
  const { t, tn } = useI18n()
  const { tasks, replaceTasks } = useTasks()
  const { reminders, replaceReminders } = useReminders()
  const { tags, replaceTags } = useTags()
  const [pending, setPending] = useState<BackupFile | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const exportBackup = () => {
    const now = new Date()
    const backup = createBackup(tasks, reminders, tags, now)
    downloadTextFile(backupFileName(now), JSON.stringify(backup, null, 2), 'application/json')
    setFeedback({ tone: 'done', message: t('backup.saved') })
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
    // Tags first: tasks refer to them. If a step fails, later ones are skipped.
    const done =
      (await replaceTags(pending.tags)) &&
      (await replaceTasks(pending.tasks)) &&
      (await replaceReminders(pending.reminders))
    if (done) {
      setPending(null)
      setFeedback({ tone: 'done', message: t('backup.restored') })
    } else {
      setFeedback({ tone: 'error', message: t('backup.restoreFailed') })
    }
  }

  return (
    <section aria-labelledby="backup-heading" className="space-y-4">
      <h3 id="backup-heading" className="text-base font-semibold">
        {t('backup.title')}
      </h3>
      <div className="space-y-6">
        <section className="space-y-2">
          <h4 className="font-medium">{t('backup.saveTitle')}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('backup.saveDescription', {
              tasks: tn('count.tasks', tasks.length),
              reminders: tn('count.reminders', reminders.length),
            })}
          </p>
          <Button variant="primary" onClick={exportBackup}>
            {t('backup.saveButton')}
          </Button>
        </section>

        <section className="space-y-2">
          <h4 className="font-medium">{t('backup.restoreTitle')}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('backup.restoreDescription')}
          </p>
          <label className="inline-flex h-11 cursor-pointer items-center rounded-lg bg-white px-4 font-medium text-slate-800 ring-1 ring-slate-300 focus-within:ring-2 focus-within:ring-brand-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600 dark:hover:bg-slate-700">
            {t('backup.chooseFile')}
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
                {t('backup.pending', {
                  backupTasks: tn('count.tasks', pending.tasks.length),
                  backupReminders: tn('count.reminders', pending.reminders.length),
                  tasks: tn('count.tasks', tasks.length),
                  reminders: tn('count.reminders', reminders.length),
                })}
              </p>
              <div className="flex gap-2">
                <Button variant="danger" onClick={() => void restore()}>
                  {t('backup.replace')}
                </Button>
                <Button
                  onClick={() => {
                    setPending(null)
                  }}
                >
                  {t('common.cancel')}
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
          {isStoragePersistent === true ? t('backup.persistent') : t('backup.notPersistent')}
        </p>
      </div>
    </section>
  )
}
