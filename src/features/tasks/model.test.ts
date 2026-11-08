import { describe, expect, it } from 'vitest'

import { makeTask } from '@/test/factories'

import { applyTaskChanges, buildTask, validateTaskInput } from './model'
import { type TaskInput } from './types'

const NOW = new Date('2026-11-08T09:00:00.000Z')
const LATER = new Date('2026-11-08T12:00:00.000Z')

const input: TaskInput = {
  title: '  Comprar pan  ',
  note: '',
  date: '2026-11-08',
  time: null,
  priority: 'low',
  tag: 'home',
}

describe('buildTask', () => {
  it('creates a pending task with trimmed text and timestamps', () => {
    const task = buildTask(input, 'abc', NOW)

    expect(task).toEqual({
      id: 'abc',
      title: 'Comprar pan',
      note: '',
      date: '2026-11-08',
      time: null,
      priority: 'low',
      tag: 'home',
      completed: false,
      completedAt: null,
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    })
  })
})

describe('applyTaskChanges', () => {
  it('sets completedAt when completing and clears it when reopening', () => {
    const completed = applyTaskChanges(makeTask(), { completed: true }, NOW)
    expect(completed.completed).toBe(true)
    expect(completed.completedAt).toBe(NOW.toISOString())

    const reopened = applyTaskChanges(completed, { completed: false }, LATER)
    expect(reopened.completed).toBe(false)
    expect(reopened.completedAt).toBeNull()
  })

  it('keeps the original completedAt when other fields change', () => {
    const task = makeTask({ completed: true, completedAt: NOW.toISOString() })
    const edited = applyTaskChanges(task, { title: 'Nuevo título' }, LATER)

    expect(edited.completedAt).toBe(NOW.toISOString())
    expect(edited.updatedAt).toBe(LATER.toISOString())
  })

  it('does not mutate the original task', () => {
    const task = makeTask({ title: 'Original' })
    applyTaskChanges(task, { title: 'Cambiado' }, NOW)
    expect(task.title).toBe('Original')
  })
})

describe('validateTaskInput', () => {
  it('accepts valid input', () => {
    expect(validateTaskInput(input)).toEqual({})
  })

  it('requires a non-blank title and a valid date', () => {
    const errors = validateTaskInput({ ...input, title: '   ', date: '' })
    expect(errors.title).toBeDefined()
    expect(errors.date).toBeDefined()
  })

  it('accepts an empty time and rejects an invalid one', () => {
    expect(validateTaskInput({ ...input, time: '09:15' })).toEqual({})
    expect(validateTaskInput({ ...input, time: '25:00' }).time).toBeDefined()
  })

  it('limits the title length', () => {
    expect(validateTaskInput({ ...input, title: 'a'.repeat(121) }).title).toBeDefined()
  })
})
