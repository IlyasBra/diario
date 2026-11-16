import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createTestRepositories } from '@/test/repositories'
import { TestProviders } from '@/test/TestProviders'

import { MainScreen } from './MainScreen'

const TODAY = '2026-11-08'
const KEY = `sk-ant-${'a'.repeat(30)}`

function renderApp() {
  render(
    <TestProviders repositories={createTestRepositories()}>
      <MainScreen today={TODAY} isPersistent />
    </TestProviders>,
  )
  return userEvent.setup()
}

function mockApi(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('assistant', () => {
  beforeEach(() => {
    window.location.hash = '#asistente'
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    window.location.hash = ''
  })

  it('asks for a valid key before chatting and remembers it', async () => {
    const user = renderApp()

    await user.type(await screen.findByLabelText('Clave de API'), 'hola')
    await user.click(screen.getByRole('button', { name: 'Guardar clave' }))
    expect(screen.getByText(/no parece válida/)).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Clave de API'))
    await user.type(screen.getByLabelText('Clave de API'), KEY)
    await user.click(screen.getByRole('button', { name: 'Guardar clave' }))
    expect(await screen.findByLabelText('Tu mensaje')).toBeInTheDocument()
    expect(window.localStorage.getItem('diario:ai-key')).toBe(KEY)

    await user.click(screen.getByRole('button', { name: 'Quitar clave' }))
    expect(await screen.findByLabelText('Clave de API')).toBeInTheDocument()
    expect(window.localStorage.getItem('diario:ai-key')).toBeNull()
  })

  it('shows the proposed plan and adds the tasks only when accepted', async () => {
    window.localStorage.setItem('diario:ai-key', KEY)
    mockApi(
      Response.json({
        content: [
          { type: 'text', text: 'Te propongo estudiar por la tarde.' },
          {
            type: 'tool_use',
            name: 'propose_tasks',
            input: {
              tasks: [
                {
                  title: 'Estudiar tema 4',
                  date: TODAY,
                  time: '17:00',
                  priority: 'high',
                  tag: 'studies',
                },
                {
                  title: 'Ir al gimnasio',
                  date: TODAY,
                  time: '19:30',
                  priority: 'medium',
                  tag: 'personal',
                },
              ],
            },
          },
        ],
      }),
    )
    const user = renderApp()

    await user.type(await screen.findByLabelText('Tu mensaje'), 'Estudio por las tardes')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByText('Te propongo estudiar por la tarde.')).toBeInTheDocument()
    expect(screen.getByText('Estudiar tema 4')).toBeInTheDocument()

    // Nothing is saved yet.
    await user.click(screen.getByRole('link', { name: 'Hoy' }))
    expect(await screen.findByText('No tienes tareas para hoy.')).toBeInTheDocument()

    // The conversation is still there after changing section.
    await user.click(screen.getByRole('link', { name: 'Asistente' }))
    await user.click(await screen.findByRole('button', { name: 'Añadir 2 tareas' }))
    expect(await screen.findByText('Tareas añadidas a tu agenda.')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Hoy' }))
    expect(await screen.findByLabelText('Estudiar tema 4')).toBeInTheDocument()
    expect(screen.getByLabelText('Ir al gimnasio')).toBeInTheDocument()
  })

  it('explains a rejected key', async () => {
    window.localStorage.setItem('diario:ai-key', KEY)
    mockApi(new Response('{}', { status: 401 }))
    const user = renderApp()

    await user.type(await screen.findByLabelText('Tu mensaje'), 'Hola')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('rechazado la clave')
  })
})
