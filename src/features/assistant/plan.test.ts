import { describe, expect, it } from 'vitest'

import { makeTask } from '@/test/factories'

import { buildSystemPrompt, MAX_PROPOSED_TASKS, parseProposedTasks, parseReply } from './plan'

const TAGS = ['home', 'work', 'other']

describe('parseProposedTasks', () => {
  it('keeps valid tasks and fills safe defaults', () => {
    const tasks = parseProposedTasks(
      {
        tasks: [
          { title: ' Estudiar ', date: '2026-11-17', time: '09:30', priority: 'high', tag: 'work' },
        ],
      },
      TAGS,
    )
    expect(tasks).toEqual([
      {
        title: 'Estudiar',
        date: '2026-11-17',
        time: '09:30',
        priority: 'high',
        tag: 'work',
        note: '',
      },
    ])
  })

  it('drops tasks without title or with a bad date', () => {
    const tasks = parseProposedTasks(
      {
        tasks: [
          { title: '', date: '2026-11-17' },
          { title: 'A', date: 'mañana' },
          'x',
          null,
          { title: 'B', date: '2026-11-18' },
        ],
      },
      TAGS,
    )
    expect(tasks.map((task) => task.title)).toEqual(['B'])
  })

  it('replaces unknown priority, tag and time', () => {
    const [task] = parseProposedTasks(
      {
        tasks: [{ title: 'A', date: '2026-11-17', time: '25:99', priority: 'urgent', tag: 'nope' }],
      },
      TAGS,
    )
    expect(task).toMatchObject({ time: null, priority: 'medium', tag: 'other' })
  })

  it('limits how many tasks are accepted', () => {
    const many = Array.from({ length: MAX_PROPOSED_TASKS + 5 }, (_, index) => ({
      title: `T${index}`,
      date: '2026-11-17',
    }))
    expect(parseProposedTasks({ tasks: many }, TAGS)).toHaveLength(MAX_PROPOSED_TASKS)
  })

  it('returns nothing for malformed input', () => {
    expect(parseProposedTasks(undefined, TAGS)).toEqual([])
    expect(parseProposedTasks({ tasks: 'x' }, TAGS)).toEqual([])
  })
})

describe('parseReply', () => {
  it('reads text and the propose_tasks call', () => {
    const reply = parseReply(
      [
        { type: 'text', text: 'Te propongo esto.' },
        {
          type: 'tool_use',
          name: 'propose_tasks',
          input: { tasks: [{ title: 'Correr', date: '2026-11-17' }] },
        },
        {
          type: 'tool_use',
          name: 'other',
          input: { tasks: [{ title: 'No', date: '2026-11-17' }] },
        },
      ],
      TAGS,
    )
    expect(reply.text).toBe('Te propongo esto.')
    expect(reply.plan.map((task) => task.title)).toEqual(['Correr'])
  })

  it('tolerates unexpected content', () => {
    expect(parseReply('nope', TAGS)).toEqual({ text: '', plan: [] })
  })
})

describe('buildSystemPrompt', () => {
  const base = {
    today: '2026-11-16',
    languageName: 'Español',
    tags: [{ id: 'work', name: 'Trabajo' }],
  }

  it('includes the date, the tags and the pending agenda', () => {
    const prompt = buildSystemPrompt({
      ...base,
      tasks: [
        makeTask({ title: 'Dentista', date: '2026-11-17', time: '10:00' }),
        makeTask({ title: 'Hecha', date: '2026-11-17', completed: true }),
        makeTask({ title: 'Lejana', date: '2026-12-30' }),
      ],
    })
    expect(prompt).toContain('2026-11-16')
    expect(prompt).toContain('work = Trabajo')
    expect(prompt).toContain('2026-11-17 10:00 Dentista')
    expect(prompt).not.toContain('Hecha')
    expect(prompt).not.toContain('Lejana')
  })

  it('says so when nothing is planned', () => {
    expect(buildSystemPrompt({ ...base, tasks: [] })).toContain('(nothing planned)')
  })
})
