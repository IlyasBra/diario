import { FALLBACK_TAG_ID } from '@/features/tags/types'
import { selectTasksByDay } from '@/features/tasks/selectors'
import { NOTE_MAX_LENGTH, TITLE_MAX_LENGTH } from '@/features/tasks/model'
import { PRIORITIES, type Priority, type Task } from '@/features/tasks/types'
import {
  addDaysToISODate,
  formatWeekday,
  type ISODate,
  isISODate,
  isTimeString,
  parseISODate,
} from '@/lib/dates'

import { type ProposedTask } from './types'

export const PROPOSE_TOOL_NAME = 'propose_tasks'
export const MAX_PROPOSED_TASKS = 20
/** How many days of the user's agenda the assistant gets to see. */
export const CONTEXT_DAYS = 14
const MAX_CONTEXT_LINES = 80

/** Tool the model calls to suggest tasks; the app shows them for the user to accept. */
export const PROPOSE_TOOL = {
  name: PROPOSE_TOOL_NAME,
  description:
    "Propose tasks to add to the user's agenda. Call it once the plan is clear, with every task of the plan. Do not call it to ask questions.",
  input_schema: {
    type: 'object',
    properties: {
      tasks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: "Short title, in the user's language." },
            date: { type: 'string', description: 'Day as YYYY-MM-DD.' },
            time: {
              type: 'string',
              description: 'Start time as HH:MM (24 h). Omit if it has no fixed time.',
            },
            priority: { type: 'string', enum: [...PRIORITIES] },
            tag: {
              type: 'string',
              description: 'Id of one of the tags listed in the system prompt.',
            },
            note: { type: 'string', description: 'Optional short detail.' },
          },
          required: ['title', 'date', 'priority', 'tag'],
        },
      },
    },
    required: ['tasks'],
  },
} as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value)
}

/**
 * Keeps the valid tasks of the model's answer. The model is not trusted:
 * anything malformed is dropped or replaced by a safe default.
 */
export function parseProposedTasks(input: unknown, tagIds: readonly string[]): ProposedTask[] {
  if (!isRecord(input) || !Array.isArray(input.tasks)) return []
  const result: ProposedTask[] = []

  for (const item of input.tasks as unknown[]) {
    if (result.length >= MAX_PROPOSED_TASKS) break
    if (!isRecord(item)) continue
    const title = typeof item.title === 'string' ? item.title.trim().slice(0, TITLE_MAX_LENGTH) : ''
    if (title === '' || typeof item.date !== 'string' || !isISODate(item.date)) continue

    result.push({
      title,
      date: item.date,
      time: typeof item.time === 'string' && isTimeString(item.time) ? item.time : null,
      priority: isPriority(item.priority) ? item.priority : 'medium',
      tag: typeof item.tag === 'string' && tagIds.includes(item.tag) ? item.tag : FALLBACK_TAG_ID,
      note: typeof item.note === 'string' ? item.note.trim().slice(0, NOTE_MAX_LENGTH) : '',
    })
  }
  return result
}

export interface AssistantReply {
  text: string
  plan: ProposedTask[]
}

/** Reads the content blocks of an API answer: the text and the suggested tasks. */
export function parseReply(content: unknown, tagIds: readonly string[]): AssistantReply {
  const texts: string[] = []
  const plan: ProposedTask[] = []
  if (Array.isArray(content)) {
    for (const block of content as unknown[]) {
      if (!isRecord(block)) continue
      if (block.type === 'text' && typeof block.text === 'string') texts.push(block.text)
      if (block.type === 'tool_use' && block.name === PROPOSE_TOOL_NAME) {
        plan.push(...parseProposedTasks(block.input, tagIds))
      }
    }
  }
  return { text: texts.join('\n').trim(), plan: plan.slice(0, MAX_PROPOSED_TASKS) }
}

export interface PromptContext {
  today: ISODate
  /** Name of the interface language, e.g. "Español". */
  languageName: string
  tags: readonly { id: string; name: string }[]
  tasks: readonly Task[]
}

function describeAgenda(today: ISODate, tasks: readonly Task[]): string {
  const to = addDaysToISODate(today, CONTEXT_DAYS - 1)
  const byDay = selectTasksByDay(tasks, today, to)
  const lines: string[] = []
  for (let offset = 0; offset < CONTEXT_DAYS; offset += 1) {
    const date = addDaysToISODate(today, offset)
    const pending = (byDay.get(date) ?? []).filter((task) => !task.completed)
    for (const task of pending) {
      lines.push(`- ${date}${task.time ? ` ${task.time}` : ''} ${task.title} (${task.priority})`)
    }
  }
  if (lines.length === 0) return '(nothing planned)'
  return lines.slice(0, MAX_CONTEXT_LINES).join('\n')
}

export function buildSystemPrompt({ today, languageName, tags, tasks }: PromptContext): string {
  const weekday = formatWeekday(parseISODate(today), 'long')
  return [
    'You are the planning assistant of Diario, a personal organiser app. The user tells you about their day-to-day (work, studies, appointments, habits, energy, constraints) and you help organise their days as well as possible.',
    `Today is ${weekday}, ${today}. Reply in the user's language (the app is set to ${languageName}).`,
    'Be brief and practical. Ask at most one or two short questions when something essential is missing (e.g. fixed commitments or deadlines); otherwise propose a plan.',
    'Spread the load realistically: do not overbook a day, leave breaks, respect fixed times, put demanding work when the user has most energy, and avoid clashes with what is already planned.',
    `When the plan is ready, call the ${PROPOSE_TOOL_NAME} tool with the tasks and add a short explanation in text. The user reviews them before anything is saved. Never claim that tasks were already added.`,
    `Available tags (use the id): ${tags.map((tag) => `${tag.id} = ${tag.name}`).join('; ')}.`,
    `Already planned for the next ${CONTEXT_DAYS} days (date, time, title, priority):`,
    describeAgenda(today, tasks),
  ].join('\n')
}
