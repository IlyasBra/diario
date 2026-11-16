import { afterEach, describe, expect, it, vi } from 'vitest'

import { AssistantError, sendToAssistant, toApiMessages } from './client'

const OPTIONS = { apiKey: 'sk-ant-test', system: 'sys', tagIds: ['other'] }
const HISTORY = [{ role: 'user' as const, text: 'Hola', plan: [] }]

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('sendToAssistant', () => {
  it('calls the API with the key and parses the answer', async () => {
    const fetchMock = mockFetch(Response.json({ content: [{ type: 'text', text: 'Buenos días' }] }))
    const reply = await sendToAssistant({ ...OPTIONS, history: HISTORY })

    expect(reply.text).toBe('Buenos días')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect(init.headers).toMatchObject({
      'x-api-key': 'sk-ant-test',
      'anthropic-dangerous-direct-browser-access': 'true',
    })
  })

  it.each([
    [401, 'auth'],
    [429, 'rateLimit'],
    [500, 'other'],
  ])('maps status %i to %s', async (status, kind) => {
    mockFetch(new Response('{}', { status }))
    await expect(sendToAssistant({ ...OPTIONS, history: HISTORY })).rejects.toMatchObject({ kind })
  })

  it('reports network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    await expect(sendToAssistant({ ...OPTIONS, history: HISTORY })).rejects.toBeInstanceOf(
      AssistantError,
    )
  })
})

describe('toApiMessages', () => {
  it('writes proposed tasks into the assistant turn', () => {
    const messages = toApiMessages([
      {
        role: 'assistant',
        text: 'Plan',
        plan: [
          {
            title: 'Correr',
            note: '',
            date: '2026-11-17',
            time: '07:00',
            priority: 'low',
            tag: 'other',
          },
        ],
      },
    ])
    expect(messages[0]?.content).toContain('2026-11-17 07:00 Correr')
  })
})
