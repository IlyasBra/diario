import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { makeTask } from '@/test/factories'
import { createTestRepositories } from '@/test/repositories'
import { TestProviders } from '@/test/TestProviders'

import { MainScreen } from './MainScreen'

const TODAY = '2026-11-08' // domingo

function renderApp(tasks = [makeTask()]) {
  const repositories = createTestRepositories()
  void repositories.tasks.replaceAll(tasks)
  render(
    <TestProviders repositories={repositories}>
      <MainScreen today={TODAY} isPersistent />
    </TestProviders>,
  )
  return { ...repositories, user: userEvent.setup() }
}

describe('repeating tasks and checklists', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('completes a daily task for today only', async () => {
    const { user, tasks } = renderApp([
      makeTask({ title: 'Beber agua', date: '2026-11-01', repeat: { kind: 'daily' } }),
    ])

    await user.click(await screen.findByLabelText('Beber agua'))

    expect(screen.getByLabelText('Beber agua')).toBeChecked()
    expect(screen.getByText('Cada día')).toBeInTheDocument()
    expect(await tasks.list()).toMatchObject([
      { doneDates: [TODAY], completed: false, date: '2026-11-01' },
    ])
  })

  it('creates a weekly task on the chosen days', async () => {
    const { user, tasks } = renderApp([])

    await user.click(await screen.findByRole('button', { name: 'Nueva tarea' }))
    const dialog = screen.getByRole('dialog', { name: 'Nueva tarea' })
    await user.type(within(dialog).getByLabelText('Título'), 'Gimnasio')
    await user.click(within(dialog).getByRole('radio', { name: 'Cada semana' }))
    // Starts with the weekday of the start date (domingo) selected; add lunes.
    await user.click(within(dialog).getByRole('checkbox', { name: 'lunes' }))
    await user.click(within(dialog).getByRole('button', { name: 'Añadir' }))

    expect(await screen.findByText('Cada lunes y domingo')).toBeInTheDocument()
    expect(await tasks.list()).toMatchObject([
      { title: 'Gimnasio', repeat: { kind: 'weekly', days: [0, 6] } },
    ])
  })

  it('requires at least one weekday for a weekly task', async () => {
    const { user } = renderApp([])

    await user.click(await screen.findByRole('button', { name: 'Nueva tarea' }))
    const dialog = screen.getByRole('dialog', { name: 'Nueva tarea' })
    await user.type(within(dialog).getByLabelText('Título'), 'Gimnasio')
    await user.click(within(dialog).getByRole('radio', { name: 'Cada semana' }))
    await user.click(within(dialog).getByRole('checkbox', { name: 'domingo' })) // unselect the only day
    await user.click(within(dialog).getByRole('button', { name: 'Añadir' }))

    expect(
      await within(dialog).findByText('Elige al menos un día de la semana.'),
    ).toBeInTheDocument()
  })

  it('keeps the checklist progress of a task', async () => {
    const { user, tasks } = renderApp([])

    await user.click(await screen.findByRole('button', { name: 'Nueva tarea' }))
    const dialog = screen.getByRole('dialog', { name: 'Nueva tarea' })
    await user.type(within(dialog).getByLabelText('Título'), 'Compra')
    await user.click(within(dialog).getByRole('button', { name: 'Añadir subtarea' }))
    await user.type(within(dialog).getByLabelText('Subtarea 1'), 'Leche')
    await user.keyboard('{Enter}')
    await user.type(within(dialog).getByLabelText('Subtarea 2'), 'Pan')
    await user.click(within(dialog).getByRole('button', { name: 'Añadir subtarea' })) // left empty on purpose
    await user.click(within(dialog).getByRole('button', { name: 'Añadir' }))

    expect(await screen.findByText('0/2')).toBeInTheDocument() // the empty item was dropped

    await user.click(screen.getByLabelText('Leche'))

    expect(await screen.findByText('1/2')).toBeInTheDocument()
    expect(await tasks.list()).toMatchObject([
      {
        subtasks: [
          { title: 'Leche', done: true },
          { title: 'Pan', done: false },
        ],
      },
    ])
  })
})
