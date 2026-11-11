import { type MessageKey, t } from '@/i18n'

import { type Priority } from './types'

const PRIORITY_KEYS: Record<Priority, MessageKey> = {
  high: 'priority.high',
  medium: 'priority.medium',
  low: 'priority.low',
}

/** User-facing label for a priority, in the current language. */
export function priorityLabel(priority: Priority): string {
  return t(PRIORITY_KEYS[priority])
}
