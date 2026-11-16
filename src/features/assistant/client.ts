import { type ProposedTask } from './types'
import { type AssistantReply, parseReply, PROPOSE_TOOL } from './plan'

const API_URL = 'https://api.anthropic.com/v1/messages'
const API_VERSION = '2023-06-01'
export const MODEL = 'claude-sonnet-5-5'
const MAX_TOKENS = 2000

export type AssistantErrorKind = 'auth' | 'rateLimit' | 'network' | 'other'

export class AssistantError extends Error {
  readonly kind: AssistantErrorKind
  constructor(kind: AssistantErrorKind, message: string) {
    super(message)
    this.name = 'AssistantError'
    this.kind = kind
  }
}

export interface HistoryMessage {
  role: 'user' | 'assistant'
  text: string
  plan: readonly ProposedTask[]
}

/**
 * The API wants alternating turns with text. Suggested tasks are written into
 * the assistant turn as text, so the model remembers what it proposed.
 */
export function toApiMessages(history: readonly HistoryMessage[]) {
  return history.map((message) => {
    const proposed = message.plan.map(
      (task) => `- ${task.date}${task.time ? ` ${task.time}` : ''} ${task.title}`,
    )
    const text =
      proposed.length > 0
        ? `${message.text}\n\n[Proposed tasks]\n${proposed.join('\n')}`
        : message.text
    return { role: message.role, content: text }
  })
}

interface SendOptions {
  apiKey: string
  system: string
  history: readonly HistoryMessage[]
  tagIds: readonly string[]
  signal?: AbortSignal
}

/** Sends the conversation straight from the browser to the API with the user's own key. */
export async function sendToAssistant({
  apiKey,
  system,
  history,
  tagIds,
  signal,
}: SendOptions): Promise<AssistantReply> {
  let response: Response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      ...(signal ? { signal } : {}),
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': API_VERSION,
        // Required by the API to accept calls made from a browser.
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        tools: [PROPOSE_TOOL],
        messages: toApiMessages(history),
      }),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new AssistantError('network', 'The request could not be sent.')
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AssistantError('auth', 'The API key was rejected.')
    }
    if (response.status === 429 || response.status === 529) {
      throw new AssistantError('rateLimit', 'The service is busy.')
    }
    throw new AssistantError('other', `The service answered with status ${response.status}.`)
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new AssistantError('other', 'The answer could not be read.')
  }
  const content =
    typeof body === 'object' && body !== null && 'content' in body ? body.content : null
  return parseReply(content, tagIds)
}
