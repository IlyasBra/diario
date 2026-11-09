import { type Tag, type TagColor } from './types'

/**
 * The tags every user starts with. Their ids match the fixed tags of earlier
 * versions ("home", "studies"…), so existing tasks keep their category.
 */
const DEFAULT_TAG_DEFINITIONS: readonly { id: string; name: string; color: TagColor }[] = [
  { id: 'home', name: 'Casa', color: 'amber' },
  { id: 'studies', name: 'Estudios', color: 'blue' },
  { id: 'work', name: 'Trabajo', color: 'violet' },
  { id: 'personal', name: 'Personal', color: 'green' },
  { id: 'other', name: 'Otros', color: 'slate' },
]

export function buildDefaultTags(now: Date): Tag[] {
  const timestamp = now.toISOString()
  return DEFAULT_TAG_DEFINITIONS.map((tag) => ({
    ...tag,
    createdAt: timestamp,
    updatedAt: timestamp,
  }))
}
