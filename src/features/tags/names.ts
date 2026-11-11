import { LANGUAGES, type MessageKey, t } from '@/i18n'
import { MESSAGES } from '@/i18n/translate'

import { type Tag } from './types'

export const DEFAULT_TAG_IDS = ['home', 'studies', 'work', 'personal', 'other'] as const
type DefaultTagId = (typeof DEFAULT_TAG_IDS)[number]

function isDefaultTagId(id: string): id is DefaultTagId {
  return (DEFAULT_TAG_IDS as readonly string[]).includes(id)
}

function defaultKey(id: DefaultTagId): MessageKey {
  return `tag.${id}`
}

/** Name of a default tag in the current language. */
export function defaultTagName(id: DefaultTagId): string {
  return t(defaultKey(id))
}

/**
 * The name to show for a tag. Default tags are stored with the name in the
 * language they were created in; while the user has not renamed them, they
 * follow the current language instead.
 */
export function tagDisplayName(tag: Pick<Tag, 'id' | 'name'>): string {
  if (!isDefaultTagId(tag.id)) return tag.name
  const stored = tag.name.trim().toLowerCase()
  const isUntouched = LANGUAGES.some(
    (language) => MESSAGES[language][defaultKey(tag.id as DefaultTagId)].toLowerCase() === stored,
  )
  return isUntouched ? defaultTagName(tag.id) : tag.name
}
