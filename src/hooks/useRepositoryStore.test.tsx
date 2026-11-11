import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { InMemoryRepository } from '@/lib/data/inMemoryRepository'
import { taskModel } from '@/features/tasks/model'
import { type Task, type TaskChanges, type TaskInput } from '@/features/tasks/types'
import { makeTask } from '@/test/factories'

import { useRepositoryStore } from './useRepositoryStore'

const MESSAGES = { create: 'c', update: 'u', remove: 'r', replace: 'p' }

/** A repository whose first update is slow, like a busy disk. */
class SlowFirstUpdate extends InMemoryRepository<Task, TaskInput, TaskChanges> {
  private calls = 0
  override async update(id: string, changes: TaskChanges): Promise<Task> {
    const isFirst = this.calls++ === 0
    if (isFirst) await new Promise((resolve) => setTimeout(resolve, 60))
    return super.update(id, changes)
  }
}

describe('useRepositoryStore', () => {
  it('keeps the last of two quick updates of the same item (move, then undo)', async () => {
    const task = makeTask({ title: 'Regar', date: '2026-11-08' })
    const repository = new SlowFirstUpdate(taskModel, [task])
    const { result } = renderHook(() => useRepositoryStore(repository, taskModel, MESSAGES))
    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })

    await act(async () => {
      const move = result.current.update(task.id, { date: '2026-11-09' })
      const undo = result.current.update(task.id, { date: '2026-11-08' })
      await Promise.all([move, undo])
    })

    expect(result.current.items[0]?.date).toBe('2026-11-08')
    expect((await repository.list())[0]?.date).toBe('2026-11-08')
  })
})
