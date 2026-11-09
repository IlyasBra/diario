import { InMemoryReminderRepository } from '@/features/reminders/data/inMemoryReminderRepository'
import { InMemoryTagRepository } from '@/features/tags/data/inMemoryTagRepository'
import { buildDefaultTags } from '@/features/tags/defaults'
import { InMemoryTaskRepository } from '@/features/tasks/data/inMemoryTaskRepository'

export interface TestRepositories {
  tasks: InMemoryTaskRepository
  reminders: InMemoryReminderRepository
  tags: InMemoryTagRepository
}

/** Fresh in-memory repositories; tags start with the defaults. */
export function createTestRepositories(
  overrides: Partial<TestRepositories> = {},
): TestRepositories {
  return {
    tasks: new InMemoryTaskRepository(),
    reminders: new InMemoryReminderRepository(),
    tags: new InMemoryTagRepository(buildDefaultTags(new Date('2026-11-01T10:00:00.000Z'))),
    ...overrides,
  }
}
