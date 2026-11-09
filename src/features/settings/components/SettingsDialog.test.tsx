import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MainScreen } from '@/app/MainScreen'
import { createBackup } from '@/features/backup/backup'
import { buildDefaultTags } from '@/features/tags/defaults'
import { makeReminder, makeTask } from '@/test/factories'
import { createTestRepositories } from '@/test/repositories'
import { TestProviders } from '@/test/TestProviders'

const TODAY = '2026-11-08'
const NOW = new Date('2026-11-08T10:00:00.000Z')

function renderApp(tasks = [makeTask({ title: 'Tarea actual', date: TODAY })]) {
  const repositories = createTestRepositories()
  void repositories.tasks.replaceAll(tasks)
  render(
    <TestProviders repositories={repositories}>
      <MainScreen today={TODAY} isPersistent />
    </TestProviders>,
  )
  return { ...repositories, user: userEvent.setup() }
}

function backupFile(content: string) {
  return new File([content], 'copia.json', { type: 'application/json' })
}

async function openSettings(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: 'Ajustes' }))
  return screen.getByRole('dialog', { name: 'Ajustes' })
}

describe('SettingsDialog', () => {
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

  describe('backup', () => {
    it('downloads a backup with the current data', async () => {
      const { user } = renderApp()
      const dialog = await openSettings(user)

      await user.click(within(dialog).getByRole('button', { name: 'Guardar copia' }))

      expect(createObjectURL).toHaveBeenCalledOnce()
      expect(await within(dialog).findByText(/Copia guardada/)).toBeInTheDocument()
    })

    it('restores a backup after confirmation, replacing the current data', async () => {
      const { user, tasks, reminders, tags } = renderApp()
      const dialog = await openSettings(user)
      const restoredTags = [
        ...buildDefaultTags(NOW),
        {
          id: 'gym',
          name: 'Gimnasio',
          color: 'red' as const,
          createdAt: NOW.toISOString(),
          updatedAt: NOW.toISOString(),
        },
      ]
      const restoredTask = makeTask({ title: 'Desde la copia', date: TODAY, tag: 'gym' })
      const restoredReminder = makeReminder({ title: 'Recordatorio copiado' })
      const text = JSON.stringify(
        createBackup([restoredTask], [restoredReminder], restoredTags, NOW),
      )

      await user.upload(within(dialog).getByLabelText('Elegir archivo'), backupFile(text))
      expect(await within(dialog).findByText(/Esto reemplazará tus 1 tarea/)).toBeInTheDocument()
      // Nothing changes until the user confirms.
      expect(await tasks.list()).toMatchObject([{ title: 'Tarea actual' }])

      await user.click(within(dialog).getByRole('button', { name: 'Reemplazar datos' }))

      expect(await within(dialog).findByText('Copia restaurada.')).toBeInTheDocument()
      expect(await tasks.list()).toEqual([restoredTask])
      expect(await reminders.list()).toEqual([restoredReminder])
      expect(await tags.list()).toEqual(restoredTags)
    })

    it('rejects an invalid file without touching the data', async () => {
      const { user, tasks } = renderApp()
      const dialog = await openSettings(user)

      await user.upload(within(dialog).getByLabelText('Elegir archivo'), backupFile('{"hola": 1}'))

      expect(await within(dialog).findByRole('alert')).toHaveTextContent(
        'Este archivo no es una copia de seguridad de Diario.',
      )
      expect(await tasks.list()).toMatchObject([{ title: 'Tarea actual' }])
    })
  })

  describe('theme', () => {
    it('switches to dark mode and remembers it', async () => {
      const { user } = renderApp()
      const dialog = await openSettings(user)

      await user.click(within(dialog).getByRole('radio', { name: 'Oscuro' }))

      expect(document.documentElement).toHaveClass('dark')
      expect(window.localStorage.getItem('diario:theme')).toBe('"dark"')

      await user.click(within(dialog).getByRole('radio', { name: 'Claro' }))
      expect(document.documentElement).not.toHaveClass('dark')
    })
  })

  describe('tags', () => {
    it('creates a tag with a colour', async () => {
      const { user, tags } = renderApp()
      const dialog = await openSettings(user)

      await user.type(within(dialog).getByLabelText('Nombre'), 'Gimnasio')
      await user.click(within(dialog).getByRole('radio', { name: 'Rojo' }))
      await user.click(within(dialog).getByRole('button', { name: 'Añadir etiqueta' }))

      expect(await within(dialog).findByText('Gimnasio')).toBeInTheDocument()
      expect(await tags.list()).toContainEqual(
        expect.objectContaining({ name: 'Gimnasio', color: 'red' }),
      )
    })

    it('rejects a duplicated name', async () => {
      const { user } = renderApp()
      const dialog = await openSettings(user)

      await user.type(within(dialog).getByLabelText('Nombre'), 'casa')
      await user.click(within(dialog).getByRole('button', { name: 'Añadir etiqueta' }))

      expect(
        await within(dialog).findByText('Ya existe una etiqueta con ese nombre.'),
      ).toBeInTheDocument()
    })

    it('moves the tasks of a deleted tag to "Otros"', async () => {
      const { user, tasks, tags } = renderApp([
        makeTask({ title: 'Entrenar', date: TODAY, tag: 'studies' }),
      ])
      const dialog = await openSettings(user)

      await user.click(within(dialog).getByRole('button', { name: 'Borrar etiqueta «Estudios»' }))
      await user.click(within(dialog).getByRole('button', { name: 'Borrar etiqueta' }))

      expect(await tasks.list()).toMatchObject([{ title: 'Entrenar', tag: 'other' }])
      expect((await tags.list()).map((tag) => tag.id)).not.toContain('studies')
    })

    it('does not offer to delete the fallback tag', async () => {
      const { user } = renderApp()
      const dialog = await openSettings(user)

      expect(
        within(dialog).queryByRole('button', { name: 'Borrar etiqueta «Otros»' }),
      ).not.toBeInTheDocument()
    })
  })
})
