import { buildDefaultTags } from '@/features/tags/defaults'

import { type DiarioDatabase } from './database'

/**
 * Creates the default tags when there are none (first run, or a database
 * upgraded from a version without tags). Existing tags are never touched.
 */
export async function ensureDefaultTags(db: DiarioDatabase, now: Date = new Date()): Promise<void> {
  if ((await db.tags.count()) === 0) await db.tags.bulkAdd(buildDefaultTags(now))
}
