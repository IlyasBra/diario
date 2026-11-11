import { defaultTagName } from './names'
import { type Tag, type TagColor } from './types'

/**
 * The tags every user starts with. Their ids match the fixed tags of earlier
 * versions ("home", "studies"…), so existing tasks keep their category.
 */
const DEFAULT_TAG_DEFINITIONS = [
  { id: 'home', color: 'amber' },
  { id: 'studies', color: 'blue' },
  { id: 'work', color: 'violet' },
  { id: 'personal', color: 'green' },
  { id: 'other', color: 'slate' },
] as const satisfies readonly { id: string; color: TagColor }[]

export function buildDefaultTags(now: Date): Tag[] {
  const timestamp = now.toISOString()
  return DEFAULT_TAG_DEFINITIONS.map((tag) => ({
    ...tag,
    // Named in the language the app is in when the tags are created.
    name: defaultTagName(tag.id),
    createdAt: timestamp,
    updatedAt: timestamp,
  }))
}
