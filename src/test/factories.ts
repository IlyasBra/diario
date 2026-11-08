import { type Task } from '@/features/tasks/types'

let sequence = 0

/** Builds a valid task for tests; override only what the test cares about. */
export function makeTask(overrides: Partial<Task> = {}): Task {
  sequence += 1
  return {
    id: `task-${sequence}`,
    title: `Tarea ${sequence}`,
    note: '',
    date: '2026-11-08',
    time: null,
    priority: 'medium',
    tag: 'personal',
    completed: false,
    completedAt: null,
    createdAt: `2026-11-01T10:00:${String(sequence % 60).padStart(2, '0')}.000Z`,
    updatedAt: '2026-11-01T10:00:00.000Z',
    ...overrides,
  }
}
