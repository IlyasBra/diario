import { t } from '@/i18n'
import { type EntityModel } from '@/lib/data/repository'

import { tagDisplayName } from './names'
import { type Tag, type TagChanges, type TagInput, TAG_COLORS } from './types'

export const TAG_NAME_MAX_LENGTH = 24

export function buildTag(input: TagInput, id: string, now: Date): Tag {
  const timestamp = now.toISOString()
  return {
    id,
    name: input.name.trim(),
    color: input.color,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function applyTagChanges(tag: Tag, changes: TagChanges, now: Date): Tag {
  return {
    ...tag,
    name: (changes.name ?? tag.name).trim(),
    color: changes.color ?? tag.color,
    updatedAt: now.toISOString(),
  }
}

export const tagModel: EntityModel<Tag, TagInput, TagChanges> = {
  build: buildTag,
  applyChanges: applyTagChanges,
}

export interface TagInputErrors {
  name?: string
}

/** `existing` are the other tags, to reject duplicated names (ignoring case). */
export function validateTagInput(input: TagInput, existing: readonly Tag[]): TagInputErrors {
  const name = input.name.trim()
  if (name.length === 0) return { name: t('error.tagNameRequired') }
  if (name.length > TAG_NAME_MAX_LENGTH)
    return { name: t('error.tagNameTooLong', { max: TAG_NAME_MAX_LENGTH }) }
  if (existing.some((tag) => tagDisplayName(tag).toLowerCase() === name.toLowerCase()))
    return { name: t('error.tagDuplicate') }
  return {}
}

export function isTagColor(value: unknown): value is Tag['color'] {
  return typeof value === 'string' && (TAG_COLORS as readonly string[]).includes(value)
}
