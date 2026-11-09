export const TAG_COLORS = [
  'slate',
  'red',
  'amber',
  'green',
  'teal',
  'blue',
  'violet',
  'pink',
] as const
export type TagColor = (typeof TAG_COLORS)[number]

/** A user-defined category for tasks, e.g. "Gimnasio". */
export interface Tag {
  id: string
  name: string
  color: TagColor
  createdAt: string
  updatedAt: string
}

export type TagInput = Pick<Tag, 'name' | 'color'>
export type TagChanges = Partial<TagInput>

/** Tasks fall back to this tag when theirs is deleted. It cannot be deleted. */
export const FALLBACK_TAG_ID = 'other'
