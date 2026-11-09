import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { makeReminder, makeTask } from '@/test/factories'
import { createTestRepositories } from '@/test/repositories'
import { TestProviders } from '@/test/TestProviders'

import { MainScreen } from './MainScreen'

const TODAY = '2026-11-08'

function renderApp() {
  const repositories = createTestRepositories()
  void repositories.tasks.replaceAll([
    makeTask({ title: 'Llamar al médico', date: TODAY, tag: 'personal', priority: 'high' }),
    makeTask({ title: 'Estudiar tema 4', date: TODAY, tag: 'studies', priority: 'low' }),
    makeTask({ title: 'Comprar pan', date: '2026-11-20', tag: 'home' }),
  ])
  void repositories.reminders.replaceAll([
    makeReminder({ title: 'Cita médico de cabecera', date: '2026-11-25' }),
  ])
  render(
    <TestProviders repositories={repositories}>
      <MainScreen today={TODAY} isPersistent />
    </TestProviders>,
  )
  return userEvent.setup()
}

describe('search and filters', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('finds tasks and reminders ignoring accents and case', async () => {
    const user = renderApp()

    await user.click(await screen.findByRole('link', { name: 'Buscar' }))
    await user.type(screen.getByRole('searchbox'), 'MEDICO')

    const tasks = await screen.findByRole('region', { name: /Tareas/ })
    expect(within(tasks).getByText('Llamar al médico')).toBeInTheDocument()
    expect(within(tasks).queryByText('Estudiar tema 4')).not.toBeInTheDocument()
    const reminders = screen.getByRole('region', { name: /Recordatorios/ })
    expect(within(reminders).getByText('Cita médico de cabecera')).toBeInTheDocument()
  })

  it('shows a message when nothing matches', async () => {
    const user = renderApp()

    await user.click(await screen.findByRole('link', { name: 'Buscar' }))
    await user.type(screen.getByRole('searchbox'), 'zzz')

    expect(await screen.findByText('No hay resultados')).toBeInTheDocument()
  })

  it('filters today by tag and priority without changing the day summary', async () => {
    const user = renderApp()
    await screen.findByLabelText('Llamar al médico')

    await user.click(screen.getByText('Filtros'))
    await user.selectOptions(screen.getByLabelText('Etiqueta'), 'Estudios')

    expect(screen.queryByLabelText('Llamar al médico')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Estudiar tema 4')).toBeInTheDocument()
    expect(screen.getByText('Hoy tienes 2 tareas, 0 completadas.')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Prioridad'), 'Alta')
    expect(
      await screen.findByText('Ninguna tarea de hoy coincide con los filtros'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Quitar filtros' }))
    expect(screen.getByLabelText('Llamar al médico')).toBeInTheDocument()
  })
})
