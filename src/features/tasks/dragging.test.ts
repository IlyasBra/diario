import { describe, expect, it } from 'vitest'

import { makeTask } from '@/test/factories'

import { resolveTaskMove } from './dragging'

describe('resolveTaskMove', () => {
  const task = makeTask({ id: 'a', date: '2026-11-08' })

  it('moves a task to another day', () => {
    expect(resolveTaskMove([task], 'a', '2026-11-10')).toEqual({
      taskId: 'a',
      from: '2026-11-08',
      to: '2026-11-10',
    })
  })

  it.each([
    ['dropped outside the targets', null],
    ['dropped on its own day', '2026-11-08'],
  ])('does nothing when %s', (_name, target) => {
    expect(resolveTaskMove([task], 'a', target)).toBeNull()
  })

  it('does nothing for repeating or unknown tasks', () => {
    const repeating = makeTask({ id: 'r', repeat: { kind: 'daily' } })
    expect(resolveTaskMove([repeating], 'r', '2026-11-10')).toBeNull()
    expect(resolveTaskMove([task], 'zzz', '2026-11-10')).toBeNull()
  })
})
