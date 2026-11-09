import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { makeReminder, makeTask } from '@/test/factories'
import { createTestRepositories } from '@/test/repositories'
import { TestProviders } from '@/test/TestProviders'

import { MainScreen } from './MainScreen'

const TODAY = '2026-11-08'

function renderApp(hash: string) {
  window.location.hash = hash
  const repositories = createTestRepositories()
  void repositories.tasks.replaceAll([
    makeTask({ title: 'Dentista', date: '2026-11-12' }),
    makeTask({ title: 'Gimnasio', date: '2026-11-02', repeat: { kind: 'weekly', days: [0] } }),
    makeTask({
      title: 'Terminada',
      date: TODAY,
      completed: true,
      completedAt: new Date(`${TODAY}T10:00:00`).toISOString(),
    }),
  ])
  void repositories.reminders.replaceAll([makeReminder({ title: 'ITV', date: '2026-11-12' })])
  render(
    <TestProviders repositories={repositories}>
      <MainScreen today={TODAY} isPersistent />
    </TestProviders>,
  )
  return { ...repositories, user: userEvent.setup() }
}

describe('calendar', () => {
  it('marks days with tasks and reminders, and lists the selected day', async () => {
    const { user } = renderApp('#calendario')

    const day = await screen.findByRole('button', {
      name: /^jueves, 12 de noviembre, 1 tarea, 1 recordatorio$/,
    })
    await user.click(day)

    expect(day).toHaveAttribute('aria-pressed', 'true')
    const tasks = screen.getByRole('region', { name: /Tareas/ })
    expect(within(tasks).getByText('Dentista')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /Recordatorios/ })).toHaveTextContent('ITV')
  })

  it('shows repeating tasks on every matching day', async () => {
    renderApp('#calendario')

    // Mondays 2, 9, 16, 23 and 30 of November 2026.
    expect(
      await screen.findByRole('button', { name: /lunes, 16 de noviembre, 1 tarea/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /lunes, 30 de noviembre, 1 tarea/ }),
    ).toBeInTheDocument()
  })

  it('browses to the next month and creates a task on the selected day', async () => {
    const { user, tasks } = renderApp('#calendario')

    await user.click(await screen.findByRole('button', { name: 'Mes siguiente' }))
    expect(screen.getByRole('heading', { name: 'diciembre de 2026' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^martes, 15 de diciembre/ }))
    await user.click(screen.getByRole('button', { name: 'Añadir tarea' }))
    const dialog = screen.getByRole('dialog', { name: 'Nueva tarea' })
    await user.type(within(dialog).getByLabelText('Título'), 'Regalos')
    await user.click(within(dialog).getByRole('button', { name: 'Añadir' }))

    expect(await tasks.list()).toContainEqual(
      expect.objectContaining({ title: 'Regalos', date: '2026-12-15' }),
    )
  })
})

describe('stats', () => {
  it('shows an empty state without completed tasks', async () => {
    window.location.hash = '#resumen'
    render(
      <TestProviders repositories={createTestRepositories()}>
        <MainScreen today={TODAY} isPersistent />
      </TestProviders>,
    )

    expect(await screen.findByText('Todavía no hay datos')).toBeInTheDocument()
  })

  it('summarises completed tasks', async () => {
    renderApp('#resumen')

    expect(await screen.findByText('Racha actual')).toBeInTheDocument()
    const streak = screen.getByText('Racha actual').closest('div')
    expect(streak).toHaveTextContent('1 día')
    const week = screen.getByText('Esta semana').closest('div')
    expect(week).toHaveTextContent('1')
  })
})
