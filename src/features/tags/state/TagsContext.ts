import { createContext } from 'react'

import { type StoreStatus } from '@/hooks/useRepositoryStore'

import { type Tag, type TagChanges, type TagInput } from '../types'

export interface TagsContextValue {
  tags: Tag[]
  status: StoreStatus
  error: string | null
  dismissError: () => void
  createTag: (input: TagInput) => Promise<boolean>
  updateTag: (id: string, changes: TagChanges) => Promise<boolean>
  deleteTag: (id: string) => Promise<boolean>
  replaceTags: (tags: readonly Tag[]) => Promise<boolean>
}

export const TagsContext = createContext<TagsContextValue | null>(null)
