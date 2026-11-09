import { type Repository } from '@/lib/data/repository'

import { type Tag, type TagChanges, type TagInput } from '../types'

export type TagRepository = Repository<Tag, TagInput, TagChanges>
