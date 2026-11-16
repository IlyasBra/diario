import { type SubmitEvent, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import { inputClassName } from '@/components/ui/styles'
import { tagDisplayName } from '@/features/tags/names'
import { useTags } from '@/features/tags/state/useTags'
import { useTasks } from '@/features/tasks/state/useTasks'
import { type MessageKey, LANGUAGE_NAMES, useI18n } from '@/i18n'
import { type ISODate } from '@/lib/dates'
import { cn } from '@/lib/cn'
import { createId } from '@/lib/id'

import { clearApiKey, loadApiKey, saveApiKey } from '../apiKey'
import { AssistantError, type AssistantErrorKind, sendToAssistant } from '../client'
import { buildSystemPrompt } from '../plan'
import { type ChatMessage, type ProposedTask } from '../types'
import { ApiKeySetup } from './ApiKeySetup'
import { PlanCard } from './PlanCard'

const ERROR_KEYS: Record<AssistantErrorKind, MessageKey> = {
  auth: 'assistant.errorAuth',
  rateLimit: 'assistant.errorRate',
  network: 'assistant.errorNetwork',
  other: 'assistant.errorOther',
}

interface AssistantViewProps {
  today: ISODate
}

/** Chat where the user describes their routine and the AI proposes a plan. */
export function AssistantView({ today }: AssistantViewProps) {
  const { t, language } = useI18n()
  const { tasks, createTask } = useTasks()
  const { tags } = useTags()
  const [apiKey, setApiKey] = useState(loadApiKey)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<AssistantErrorKind | null>(null)
  const [handled, setHandled] = useState<ReadonlyMap<string, 'added' | 'discarded'>>(new Map())
  const abortRef = useRef<AbortController | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  // Cancel a pending request when leaving the screen.
  useEffect(
    () => () => {
      abortRef.current?.abort()
    },
    [],
  )

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, sending])

  if (!apiKey) {
    return (
      <ApiKeySetup
        onSave={(key) => {
          saveApiKey(key)
          setApiKey(key)
        }}
      />
    )
  }

  const activeKey = apiKey

  async function send(text: string) {
    const userMessage: ChatMessage = { id: createId(), role: 'user', text, plan: [] }
    const history = [...messages, userMessage]
    setMessages(history)
    setDraft('')
    setError(null)
    setSending(true)

    const controller = new AbortController()
    abortRef.current = controller
    try {
      const reply = await sendToAssistant({
        apiKey: activeKey,
        system: buildSystemPrompt({
          today,
          languageName: LANGUAGE_NAMES[language],
          tags: tags.map((tag) => ({ id: tag.id, name: tagDisplayName(tag) })),
          tasks,
        }),
        history,
        tagIds: tags.map((tag) => tag.id),
        signal: controller.signal,
      })
      if (reply.text === '' && reply.plan.length === 0) {
        setError('other')
        return
      }
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: 'assistant',
          text: reply.text === '' ? t('assistant.planOnly') : reply.text,
          plan: reply.plan,
        },
      ])
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return
      setError(caught instanceof AssistantError ? caught.kind : 'other')
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (text === '' || sending) return
    void send(text)
  }

  async function addPlan(messageId: string, plan: readonly ProposedTask[]) {
    setAdding(true)
    for (const task of plan) {
      await createTask({ ...task, repeat: { kind: 'none' }, subtasks: [] })
    }
    setHandled((current) => new Map(current).set(messageId, 'added'))
    setAdding(false)
  }

  function startOver() {
    abortRef.current?.abort()
    setMessages([])
    setHandled(new Map())
    setError(null)
    setSending(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{t('assistant.title')}</h2>
        <div className="flex gap-1">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={startOver}>
              {t('assistant.newChat')}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearApiKey()
              setApiKey(null)
              startOver()
            }}
          >
            {t('assistant.removeKey')}
          </Button>
        </div>
      </div>

      {messages.length === 0 && (
        <p className="text-slate-700 dark:text-slate-300">{t('assistant.intro')}</p>
      )}

      <div role="log" aria-label={t('assistant.log')} aria-live="polite" className="space-y-3">
        {messages.map((message) => {
          const state = handled.get(message.id)
          return (
            <div
              key={message.id}
              className={cn(
                'max-w-[90%] rounded-2xl px-4 py-3',
                message.role === 'user'
                  ? 'ms-auto bg-brand-600 text-white'
                  : 'bg-white ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700',
              )}
            >
              <p className="sr-only">
                {message.role === 'user' ? t('assistant.you') : t('assistant.name')}
              </p>
              <p className="whitespace-pre-wrap">{message.text}</p>
              {message.plan.length > 0 && state !== 'discarded' && (
                <PlanCard
                  plan={message.plan}
                  today={today}
                  added={state === 'added'}
                  busy={adding}
                  onAdd={() => {
                    void addPlan(message.id, message.plan)
                  }}
                  onDiscard={() => {
                    setHandled((current) => new Map(current).set(message.id, 'discarded'))
                  }}
                />
              )}
            </div>
          )
        })}
        {sending && (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('assistant.thinking')}</p>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <Notice
          tone="error"
          onDismiss={() => {
            setError(null)
          }}
        >
          {t(ERROR_KEYS[error])}
        </Notice>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor="assistant-message" className="sr-only">
          {t('assistant.inputLabel')}
        </label>
        <textarea
          id="assistant-message"
          rows={3}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
          }}
          placeholder={t('assistant.placeholder')}
          maxLength={4000}
          className={inputClassName}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-600 dark:text-slate-400">{t('assistant.privacy')}</p>
          <Button type="submit" variant="primary" disabled={sending || draft.trim() === ''}>
            {t('assistant.send')}
          </Button>
        </div>
      </form>
    </div>
  )
}
