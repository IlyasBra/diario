import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MainScreen } from '@/app/MainScreen'
import { InMemoryReminderRepository } from '@/features/reminders/data/inMemoryReminderRepository'
import { RemindersProvider } from '@/features/reminders/state/RemindersProvider'
import { InMemoryTaskRepository } from '@/features/tasks/data/inMemoryTaskRepository'
import { TasksProvider } from '@/features/tasks/state/TasksProvider'
import { makeReminder, makeTask } from '@/test/factories'

import { createBackup } from '../backup'

const TODAY = '2026-11-08'

function renderApp(tasks = [makeTask({ title: 'Tarea actual', date: TODAY })]) {
  const taskRepository = new InMemoryTaskRepository(tasks)
  const reminderRepository = new InMemoryReminderRepository()
  render(
    <TasksProvider repository={taskRepository}>
      <RemindersProvider repository={reminderRepository}>
        <MainScreen today={TODAY} isPersistent />
      </RemindersProvider>
    </TasksProvider>,
  )
  return { taskRepository, reminderRepository, user: userEvent.setup() }
}

function backupFile(content: string) {
  return new File([content], 'copia.json', { type: 'application/json' })
}

describe('BackupDialog', () => {
  const createObjectURL = vi.fn(() => 'blob:fake')

  beforeEach(() => {
    window.location.hash = ''
    createObjectURL.mockClear()
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() }))
    // jsdom cannot navigate to a download link.
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  async function openDialog(user: ReturnType<typeof userEvent.setup>) {
    await user.click(await screen.findByRole('button', { name: 'Copia de seguridad' }))
    return screen.getByRole('dialog', { name: 'Copia de seguridad' })
  }

  it('downloads a backup with the current data', async () => {
    const { user } = renderApp()
    const dialog = await openDialog(user)

    await user.click(within(dialog).getByRole('button', { name: 'Guardar copia' }))

    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(await within(dialog).findByText(/Copia guardada/)).toBeInTheDocument()
  })

  it('restores a backup after confirmation, replacing the current data', async () => {
    const { user, taskRepository, reminderRepository } = renderApp()
    const dialog = await openDialog(user)
    const restoredTask = makeTask({ title: 'Desde la copia', date: TODAY })
    const restoredReminder = makeReminder({ title: 'Recordatorio copiado' })
    const text = JSON.stringify(createBackup([restoredTask], [restoredReminder], new Date()))

    await user.upload(within(dialog).getByLabelText('Elegir archivo'), backupFile(text))
    expect(await within(dialog).findByText(/Esto reemplazará tus 1 tarea/)).toBeInTheDocument()
    // Nothing changes until the user confirms.
    expect(await taskRepository.list()).toMatchObject([{ title: 'Tarea actual' }])

    await user.click(within(dialog).getByRole('button', { name: 'Reemplazar datos' }))

    expect(await within(dialog).findByText('Copia restaurada.')).toBeInTheDocument()
    expect(await taskRepository.list()).toEqual([restoredTask])
    expect(await reminderRepository.list()).toEqual([restoredReminder])
  })

  it('rejects an invalid file without touching the data', async () => {
    const { user, taskRepository } = renderApp()
    const dialog = await openDialog(user)

    await user.upload(within(dialog).getByLabelText('Elegir archivo'), backupFile('{"hola": 1}'))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Este archivo no es una copia de seguridad de Diario.',
    )
    expect(await taskRepository.list()).toMatchObject([{ title: 'Tarea actual' }])
  })
})
