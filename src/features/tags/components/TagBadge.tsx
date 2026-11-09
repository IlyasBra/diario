import { cn } from '@/lib/cn'

import { TAG_COLOR_CLASSES } from '../colors'
import { useTags } from '../state/useTags'

interface TagBadgeProps {
  tagId: string
}

/** Small coloured label with the tag's name; a neutral one if the tag is gone. */
export function TagBadge({ tagId }: TagBadgeProps) {
  const { tags } = useTags()
  const tag = tags.find((candidate) => candidate.id === tagId)
  const colors = TAG_COLOR_CLASSES[tag?.color ?? 'slate']

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium',
        colors.badge,
      )}
    >
      {tag?.name ?? 'Sin etiqueta'}
    </span>
  )
}
