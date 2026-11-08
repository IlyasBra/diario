import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InMemoryReminderRepository } from '@/features/reminders/data/inMemoryReminderRepository'
import { RemindersProvider } from '@/features/reminders/state/RemindersProvider'
import { type Reminder } from '@/features/reminders/types'
import { InMemoryTaskRepository } from '@/features/tasks/data/inMemoryTaskRepository'
import { TasksProvider } from '@/features/tasks/state/TasksProvider'
import { type Task } from '@/features/tasks/types'
import { makeReminder, makeTask } from '@/test/factories'

import { MainScreen } from './MainScreen'

function renderApp({ reminders = [], tasks = [] }: { reminders?: Reminder[]; tasks?: Task[] }) {
  render(
    <TasksProvider repository={new InMemoryTaskRepository(tasks)}>
      <RemindersProvider repository={new InMemoryReminderRepository(reminders)}>
        <MainScreen today="2026-11-11" isPersistent />
      </RemindersProvider>
    </TasksProvider>,
  )
}

describe('alerts', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.location.hash = ''
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('shows a due reminder and a timed task inside the app when notifications are unavailable', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })
    vi.setSystemTime(new Date(2026, 10, 11, 9, 59, 45))
    renderApp({
      reminders: [makeReminder({ title: 'ITV', date: '2026-11-11', time: '10:00' })],
      tasks: [makeTask({ title: 'Llamar al banco', date: '2026-11-11', time: '10:00' })],
    })
    await screen.findByRole('heading', { name: 'Hoy', level: 1 })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000)
    })

    const alerts = await screen.findAllByRole('alert')
    expect(alerts.map((alert) => alert.textContent)).toEqual([
      expect.stringContaining('ITV'),
      expect.stringContaining('Llamar al banco'),
    ])
  })

  it('asks for permission only when the user taps "Activar avisos"', async () => {
    const requestPermission = vi.fn(() => Promise.resolve<NotificationPermission>('granted'))
    vi.stubGlobal(
      'Notification',
      Object.assign(vi.fn(), { permission: 'default', requestPermission }),
    )
    window.location.hash = '#recordatorios'
    renderApp({})
    const user = userEvent.setup()

    await screen.findByText('¿Te aviso a la hora?')
    expect(requestPermission).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Activar avisos' }))

    expect(requestPermission).toHaveBeenCalledOnce()
    expect(await screen.findByText(/Avisos activados/)).toBeInTheDocument()
  })

  it('remembers "Ahora no"', async () => {
    vi.stubGlobal(
      'Notification',
      Object.assign(vi.fn(), { permission: 'default', requestPermission: vi.fn() }),
    )
    window.location.hash = '#recordatorios'
    renderApp({})
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: 'Ahora no' }))

    expect(screen.queryByText('¿Te aviso a la hora?')).not.toBeInTheDocument()
    expect(window.localStorage.getItem('diario:notification-prompt-dismissed')).toBe('true')
  })
})
