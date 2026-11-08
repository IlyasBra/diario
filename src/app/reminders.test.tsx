import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InMemoryReminderRepository } from '@/features/reminders/data/inMemoryReminderRepository'
import { RemindersProvider } from '@/features/reminders/state/RemindersProvider'
import { type Reminder } from '@/features/reminders/types'
import { InMemoryTaskRepository } from '@/features/tasks/data/inMemoryTaskRepository'
import { TasksProvider } from '@/features/tasks/state/TasksProvider'
import { makeReminder } from '@/test/factories'

import { MainScreen } from './MainScreen'

// Wednesday 11 November 2026, 12:00 local time.
const NOW = new Date(2026, 10, 11, 12, 0)

function renderReminders(initialReminders: Reminder[] = []) {
  const repository = new InMemoryReminderRepository(initialReminders)
  render(
    <TasksProvider repository={new InMemoryTaskRepository()}>
      <RemindersProvider repository={repository}>
        <MainScreen today="2026-11-11" isPersistent />
      </RemindersProvider>
    </TasksProvider>,
  )
  return { repository, user: userEvent.setup() }
}

describe('Reminders screen', () => {
  beforeEach(() => {
    // Only fake the clock; user-event still needs real timers.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    window.location.hash = '#recordatorios'
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows this week grouped by day and hides later reminders', async () => {
    renderReminders([
      makeReminder({ title: 'ITV', date: '2026-11-13', time: '10:00' }),
      makeReminder({ title: 'Dentista', date: '2026-11-20', time: '17:00' }),
    ])

    const friday = await screen.findByRole('region', { name: 'viernes, 13 de noviembre' })
    expect(within(friday).getByText('ITV')).toBeInTheDocument()
    expect(within(friday).getByText('10:00')).toBeInTheDocument()
    expect(screen.queryByText('Dentista')).not.toBeInTheDocument()
  })

  it('switches to this month', async () => {
    const { user } = renderReminders([
      makeReminder({ title: 'Dentista', date: '2026-11-20', time: '17:00' }),
    ])

    await user.click(await screen.findByRole('radio', { name: 'Este mes' }))

    expect(screen.getByText('Dentista')).toBeInTheDocument()
  })

  it('creates a yearly reminder and shows its next occurrence under "Todos"', async () => {
    const { user, repository } = renderReminders()

    await user.click(await screen.findByRole('button', { name: 'Nuevo recordatorio' }))
    const dialog = screen.getByRole('dialog', { name: 'Nuevo recordatorio' })
    await user.type(within(dialog).getByLabelText('Título'), 'Cumpleaños de mamá')
    const date = within(dialog).getByLabelText('Fecha')
    await user.clear(date)
    await user.type(date, '1965-03-02')
    await user.click(within(dialog).getByRole('radio', { name: 'Cada año' }))
    await user.click(within(dialog).getByRole('button', { name: 'Añadir' }))

    expect(await repository.list()).toMatchObject([
      { title: 'Cumpleaños de mamá', date: '1965-03-02', time: '09:00', repeat: 'yearly' },
    ])

    await user.click(screen.getByRole('radio', { name: 'Todos' }))
    const day = screen.getByRole('region', { name: 'martes, 2 de marzo de 2027' })
    expect(within(day).getByText('Cumpleaños de mamá')).toBeInTheDocument()
    expect(within(day).getByText('Cada año')).toBeInTheDocument()
  })
})
