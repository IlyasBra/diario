import { type ISODate, type TimeString } from '@/lib/dates'
import { type Priority } from '@/features/tasks/types'

/** A task the assistant suggests. Nothing is saved until the user accepts it. */
export interface ProposedTask {
  title: string
  note: string
  date: ISODate
  time: TimeString | null
  priority: Priority
  /** Id of one of the user's tags. */
  tag: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  /** Tasks suggested in this message (assistant only). */
  plan: ProposedTask[]
}
