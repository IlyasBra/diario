import { InMemoryRepository } from '@/lib/data/inMemoryRepository'

import { tagModel } from '../model'
import { type Tag, type TagChanges, type TagInput } from '../types'

export class InMemoryTagRepository extends InMemoryRepository<Tag, TagInput, TagChanges> {
  constructor(initialTags: readonly Tag[] = []) {
    super(tagModel, initialTags)
  }
}
