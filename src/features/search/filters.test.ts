import { describe, expect, it } from 'vitest'

import { buildDefaultTags } from '@/features/tags/defaults'
import { makeReminder, makeTask } from '@/test/factories'

import { EMPTY_FILTER, filterTasks, isFilterActive, searchAll } from './filters'

const TAGS = buildDefaultTags(new Date('2026-11-01T10:00:00.000Z'))

const tasks = [
  makeTask({ title: 'Llamar al médico', tag: 'personal', priority: 'high' }),
  makeTask({ title: 'Estudiar tema 4', tag: 'studies', priority: 'medium' }),
  makeTask({
    title: 'Compra',
    tag: 'home',
    priority: 'low',
    subtasks: [{ id: 's1', title: 'Leche de avena', done: false }],
  }),
]

describe('filterTasks', () => {
  it('filters by tag and by priority, combined with AND', () => {
    expect(filterTasks(tasks, { tagId: 'studies', priority: null }).map((t) => t.title)).toEqual([
      'Estudiar tema 4',
    ])
    expect(filterTasks(tasks, { tagId: null, priority: 'high' })).toHaveLength(1)
    expect(filterTasks(tasks, { tagId: 'studies', priority: 'high' })).toEqual([])
    expect(filterTasks(tasks, EMPTY_FILTER)).toHaveLength(3)
  })

  it('knows when a filter is active', () => {
    expect(isFilterActive(EMPTY_FILTER)).toBe(false)
    expect(isFilterActive({ tagId: 'home', priority: null })).toBe(true)
  })
})

describe('searchAll', () => {
  const reminders = [
    makeReminder({ title: 'Cita médico de cabecera' }),
    makeReminder({ title: 'ITV' }),
  ]

  it('finds tasks and reminders ignoring accents and case', () => {
    const result = searchAll(tasks, reminders, TAGS, 'MEDICO', EMPTY_FILTER)

    expect(result.tasks.map((t) => t.title)).toEqual(['Llamar al médico'])
    expect(result.reminders.map((r) => r.title)).toEqual(['Cita médico de cabecera'])
  })

  it('looks inside checklists and tag names', () => {
    expect(searchAll(tasks, [], TAGS, 'avena', EMPTY_FILTER).tasks.map((t) => t.title)).toEqual([
      'Compra',
    ])
    expect(searchAll(tasks, [], TAGS, 'estudios', EMPTY_FILTER).tasks.map((t) => t.title)).toEqual([
      'Estudiar tema 4',
    ])
  })

  it('hides reminders while a task filter is active', () => {
    const result = searchAll(tasks, reminders, TAGS, 'medico', {
      tagId: 'personal',
      priority: null,
    })

    expect(result.tasks).toHaveLength(1)
    expect(result.reminders).toEqual([])
  })
})
