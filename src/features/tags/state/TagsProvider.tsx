import { type ReactNode, useMemo } from 'react'

import { type StoreErrorMessages, useRepositoryStore } from '@/hooks/useRepositoryStore'
import { useI18n } from '@/i18n'

import { type TagRepository } from '../data/tagRepository'
import { tagModel } from '../model'
import { TagsContext, type TagsContextValue } from './TagsContext'

interface TagsProviderProps {
  repository: TagRepository
  children: ReactNode
}

export function TagsProvider({ repository, children }: TagsProviderProps) {
  const { t } = useI18n()
  const messages = useMemo<StoreErrorMessages>(
    () => ({
      create: t('store.tag.create'),
      update: t('store.tag.update'),
      remove: t('store.tag.remove'),
      replace: t('store.tag.replace'),
    }),
    [t],
  )
  const store = useRepositoryStore(repository, tagModel, messages)

  const value = useMemo<TagsContextValue>(
    () => ({
      // Creation order, so new tags appear at the end of the pickers.
      tags: store.items.toSorted((a, b) => a.createdAt.localeCompare(b.createdAt)),
      status: store.status,
      error: store.error,
      dismissError: store.dismissError,
      createTag: store.create,
      updateTag: store.update,
      deleteTag: store.remove,
      replaceTags: store.replaceAll,
    }),
    [store],
  )

  return <TagsContext value={value}>{children}</TagsContext>
}
