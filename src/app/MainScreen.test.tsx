import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { InMemoryReminderRepository } from '@/features/reminders/data/inMemoryReminderRepository'
import { RemindersProvider } from '@/features/reminders/state/RemindersProvider'
import { InMemoryTaskRepository } from '@/features/tasks/data/inMemoryTaskRepository'
import { TasksProvider } from '@/features/tasks/state/TasksProvider'
import { type Task } from '@/features/tasks/types'
import { makeTask } from '@/test/factories'

import { MainScreen } from './MainScreen'

const TODAY = '2026-11-08'

function renderApp(initialTasks: Task[] = []) {
  const repository = new InMemoryTaskRepository(initialTasks)
  render(
    <TasksProvider repository={repository}>
      <RemindersProvider repository={new InMemoryReminderRepository()}>
        <MainScreen today={TODAY} isPersistent />
      </RemindersProvider>
    </TasksProvider>,
  )
  return { repository, user: userEvent.setup() }
}

describe('MainScreen', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('creates a task for today from the dialog', async () => {
    const { user, repository } = renderApp()

    await user.click(await screen.findByRole('button', { name: 'Nueva tarea' }))
    const dialog = screen.getByRole('dialog', { name: 'Nueva tarea' })
    await user.type(within(dialog).getByLabelText('Título'), 'Comprar pan')
    await user.type(within(dialog).getByLabelText('Hora (opcional)'), '10:30')
    await user.click(within(dialog).getByRole('radio', { name: 'Alta' }))
    await user.click(within(dialog).getByRole('button', { name: 'Añadir' }))

    expect(await screen.findByLabelText('Comprar pan')).not.toBeChecked()
    expect(screen.getByText('10:30')).toBeInTheDocument()
    expect(screen.getByText('Hoy tienes 1 tarea, 0 completadas.')).toBeInTheDocument()
    expect(await repository.list()).toMatchObject([
      { title: 'Comprar pan', date: TODAY, time: '10:30', priority: 'high' },
    ])
  })

  it('shows a validation error instead of saving an empty title', async () => {
    const { user, repository } = renderApp()

    await user.click(await screen.findByRole('button', { name: 'Nueva tarea' }))
    await user.click(screen.getByRole('button', { name: 'Añadir' }))

    expect(screen.getByLabelText('Título')).toHaveAccessibleDescription('Escribe un título.')
    expect(await repository.list()).toEqual([])
  })

  it('completes a task and updates the summary', async () => {
    const { user } = renderApp([makeTask({ title: 'Estudiar', date: TODAY })])

    await user.click(await screen.findByLabelText('Estudiar'))

    expect(screen.getByLabelText('Estudiar')).toBeChecked()
    expect(screen.getByText('Hoy tienes 1 tarea, 1 completada.')).toBeInTheDocument()
  })

  it('rolls back an optimistic update and shows an error when saving fails', async () => {
    class FailingRepository extends InMemoryTaskRepository {
      override update(): Promise<Task> {
        return Promise.reject(new Error('disk full'))
      }
    }
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(
      <TasksProvider repository={new FailingRepository([makeTask({ title: 'Leer', date: TODAY })])}>
        <RemindersProvider repository={new InMemoryReminderRepository()}>
          <MainScreen today={TODAY} isPersistent />
        </RemindersProvider>
      </TasksProvider>,
    )

    await userEvent.click(await screen.findByLabelText('Leer'))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido guardar la tarea.')
    expect(screen.getByLabelText('Leer')).not.toBeChecked()
  })

  it('marks overdue tasks and moves them to tomorrow', async () => {
    const { user, repository } = renderApp([makeTask({ title: 'Pagar luz', date: '2026-11-05' })])

    const overdue = await screen.findByRole('region', { name: /Atrasadas/ })
    expect(within(overdue).getByText('Atrasada · 5 nov')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Pasar «Pagar luz» a mañana' }))

    expect(screen.queryByRole('region', { name: /Atrasadas/ })).not.toBeInTheDocument()
    expect(await repository.list()).toMatchObject([{ title: 'Pagar luz', date: '2026-11-09' }])
  })

  it('edits and then deletes a task after confirmation', async () => {
    const { user, repository } = renderApp([makeTask({ title: 'Llamar', date: TODAY })])

    await user.click(await screen.findByRole('button', { name: 'Editar «Llamar»' }))
    const title = screen.getByLabelText('Título')
    await user.clear(title)
    await user.type(title, 'Llamar a mamá')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(await screen.findByLabelText('Llamar a mamá')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Editar «Llamar a mamá»' }))
    await user.click(screen.getByRole('button', { name: 'Borrar tarea' }))
    await user.click(screen.getByRole('button', { name: 'Borrar' }))

    expect(screen.queryByLabelText('Llamar a mamá')).not.toBeInTheDocument()
    expect(await repository.list()).toEqual([])
  })

  it('lists future tasks grouped by day in the upcoming view', async () => {
    window.location.hash = '#proximos'
    renderApp([
      makeTask({ title: 'Dentista', date: '2026-11-10' }),
      makeTask({ title: 'Gimnasio', date: '2026-11-09' }),
    ])

    const tomorrow = await screen.findByRole('region', { name: /Mañana/ })
    expect(within(tomorrow).getByText('Gimnasio')).toBeInTheDocument()
    const tuesday = screen.getByRole('region', { name: /martes, 10 de noviembre/ })
    expect(within(tuesday).getByText('Dentista')).toBeInTheDocument()
  })
})
