import { use } from 'react'

import { TagsContext, type TagsContextValue } from './TagsContext'

export function useTags(): TagsContextValue {
  const context = use(TagsContext)
  if (!context) throw new Error('useTags must be used inside <TagsProvider>')
  return context
}
