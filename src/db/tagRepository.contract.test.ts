import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { InMemoryTagRepository } from '@/features/tags/data/inMemoryTagRepository'
import { type TagRepository } from '@/features/tags/data/tagRepository'
import { tagModel } from '@/features/tags/model'
import { EntityNotFoundError } from '@/lib/data/repository'

import { DiarioDatabase } from './database'
import { DexieRepository } from './dexieRepository'
import { ensureDefaultTags } from './ensureDefaultTags'

const implementations: [string, () => { repo: TagRepository; cleanup: () => Promise<void> }][] = [
  [
    'DexieRepository<Tag>',
    () => {
      const db = new DiarioDatabase(`test-${crypto.randomUUID()}`)
      return { repo: new DexieRepository(db.tags, tagModel), cleanup: () => db.delete() }
    },
  ],
  [
    'InMemoryTagRepository',
    () => ({ repo: new InMemoryTagRepository(), cleanup: () => Promise.resolve() }),
  ],
]

describe.each(implementations)('%s', (_name, setup) => {
  let repo: TagRepository
  let cleanup: () => Promise<void>

  beforeEach(() => {
    ;({ repo, cleanup } = setup())
  })

  afterEach(async () => {
    await cleanup()
  })

  it('creates, updates and removes tags', async () => {
    const created = await repo.create({ name: '  Gimnasio ', color: 'red' })
    expect(created).toMatchObject({ name: 'Gimnasio', color: 'red' })

    const updated = await repo.update(created.id, { color: 'blue' })
    expect(updated).toMatchObject({ name: 'Gimnasio', color: 'blue' })

    await repo.remove(created.id)
    expect(await repo.list()).toEqual([])
  })

  it('rejects updates to a missing tag', async () => {
    await expect(repo.update('missing', { name: 'x' })).rejects.toBeInstanceOf(EntityNotFoundError)
  })

  it('replaces every tag at once', async () => {
    await repo.create({ name: 'Vieja', color: 'slate' })
    const restored = [await new InMemoryTagRepository().create({ name: 'Nueva', color: 'teal' })]

    await repo.replaceAll(restored)

    expect(await repo.list()).toEqual(restored)
  })
})

describe('ensureDefaultTags', () => {
  it('creates the defaults once and never overwrites existing tags', async () => {
    const db = new DiarioDatabase(`test-${crypto.randomUUID()}`)
    await ensureDefaultTags(db)
    expect((await db.tags.toArray()).map((tag) => tag.id)).toEqual(
      expect.arrayContaining(['home', 'studies', 'work', 'personal', 'other']),
    )

    await db.tags.delete('home')
    await ensureDefaultTags(db)
    expect(await db.tags.get('home')).toBeUndefined() // user's choice is respected
    await db.delete()
  })
})
