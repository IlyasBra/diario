import { type Reminder } from '@/features/reminders/types'
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
    repeat: { kind: 'none' },
    doneDates: [],
    subtasks: [],
    createdAt: `2026-11-01T10:00:${String(sequence % 60).padStart(2, '0')}.000Z`,
    updatedAt: '2026-11-01T10:00:00.000Z',
    ...overrides,
  }
}

export function makeReminder(overrides: Partial<Reminder> = {}): Reminder {
  sequence += 1
  return {
    id: `reminder-${sequence}`,
    title: `Recordatorio ${sequence}`,
    note: '',
    date: '2026-11-10',
    time: '09:00',
    repeat: 'none',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
    ...overrides,
  }
}
