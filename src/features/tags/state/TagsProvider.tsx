import { type ReactNode, useMemo } from 'react'

import { type StoreErrorMessages, useRepositoryStore } from '@/hooks/useRepositoryStore'

import { type TagRepository } from '../data/tagRepository'
import { tagModel } from '../model'
import { TagsContext, type TagsContextValue } from './TagsContext'

const ERROR_MESSAGES: StoreErrorMessages = {
  create: 'No se ha podido crear la etiqueta.',
  update: 'No se ha podido guardar la etiqueta.',
  remove: 'No se ha podido borrar la etiqueta.',
  replace: 'No se han podido restaurar las etiquetas.',
}

interface TagsProviderProps {
  repository: TagRepository
  children: ReactNode
}

export function TagsProvider({ repository, children }: TagsProviderProps) {
  const store = useRepositoryStore(repository, tagModel, ERROR_MESSAGES)

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
