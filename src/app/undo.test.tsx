import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { makeTask } from '@/test/factories'
import { createTestRepositories } from '@/test/repositories'
import { TestProviders } from '@/test/TestProviders'

import { MainScreen } from './MainScreen'

const TODAY = '2026-11-08'

function renderApp() {
  const repositories = createTestRepositories()
  void repositories.tasks.replaceAll([makeTask({ title: 'Estudiar', date: TODAY })])
  render(
    <TestProviders repositories={repositories}>
      <MainScreen today={TODAY} isPersistent />
    </TestProviders>,
  )
  return { ...repositories, user: userEvent.setup() }
}

describe('undo', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('undoes completing a task', async () => {
    const { user, tasks } = renderApp()

    await user.click(await screen.findByLabelText('Estudiar'))
    expect(await screen.findByText('Tarea completada')).toBeInTheDocument()
    expect(screen.getByLabelText('Estudiar')).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Deshacer' }))

    expect(screen.getByLabelText('Estudiar')).not.toBeChecked()
    expect(screen.queryByText('Tarea completada')).not.toBeInTheDocument()
    expect(await tasks.list()).toMatchObject([{ completed: false }])
  })

  it('undoes deleting a task, restoring it as it was', async () => {
    const { user, tasks } = renderApp()
    const [original] = await tasks.list()

    await user.click(await screen.findByRole('button', { name: 'Editar «Estudiar»' }))
    const dialog = screen.getByRole('dialog', { name: 'Editar tarea' })
    await user.click(within(dialog).getByRole('button', { name: 'Borrar tarea' }))
    await user.click(within(dialog).getByRole('button', { name: 'Borrar' }))

    expect(await screen.findByText('Tarea borrada')).toBeInTheDocument()
    expect(screen.queryByLabelText('Estudiar')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Deshacer' }))

    expect(await screen.findByLabelText('Estudiar')).toBeInTheDocument()
    expect(await tasks.list()).toEqual([original])
  })
})
