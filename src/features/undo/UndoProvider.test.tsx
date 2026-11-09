import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { UNDO_DURATION_MS, UndoProvider } from './UndoProvider'
import { useUndo } from './useUndo'

function Trigger({ onUndo }: { onUndo: () => void }) {
  const { showUndo } = useUndo()
  return (
    <button
      onClick={() => {
        showUndo('Hecho', onUndo)
      }}
    >
      Disparar
    </button>
  )
}

describe('UndoProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('hides the message after a few seconds without undoing', () => {
    const onUndo = vi.fn()
    render(
      <UndoProvider>
        <Trigger onUndo={onUndo} />
      </UndoProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Disparar' }))
    expect(screen.getByText('Hecho')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(UNDO_DURATION_MS + 100)
    })

    expect(screen.queryByText('Hecho')).not.toBeInTheDocument()
    expect(onUndo).not.toHaveBeenCalled()
  })

  it('runs the undo action once and closes', () => {
    const onUndo = vi.fn()
    render(
      <UndoProvider>
        <Trigger onUndo={onUndo} />
      </UndoProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Disparar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }))

    expect(onUndo).toHaveBeenCalledOnce()
    expect(screen.queryByText('Hecho')).not.toBeInTheDocument()
  })
})
