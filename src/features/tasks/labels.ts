import { type Priority, type Tag } from './types'

/** User-facing (Spanish) labels for the values stored in English. */
export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

export const TAG_LABELS: Record<Tag, string> = {
  home: 'Casa',
  studies: 'Estudios',
  work: 'Trabajo',
  personal: 'Personal',
  other: 'Otros',
}
