import { type MessageKey, t } from '@/i18n'

import { type Repeat } from './types'

const REPEAT_KEYS: Record<Repeat, MessageKey> = {
  none: 'repeat.none',
  monthly: 'repeat.monthly',
  yearly: 'repeat.yearly',
}

/** User-facing label for a reminder's repetition, in the current language. */
export function repeatLabel(repeat: Repeat): string {
  return t(REPEAT_KEYS[repeat])
}
