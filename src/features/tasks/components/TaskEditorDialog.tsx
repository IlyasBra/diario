import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { TrashIcon } from '@/components/ui/icons'
import { type ISODate } from '@/lib/dates'

import { toTaskInput } from '../model'
import { useTasks } from '../state/useTasks'
import { type Task, type TaskInput } from '../types'
import { TaskForm } from './TaskForm'

/** What the editor is doing: creating on a given day, or editing a task. */
export type TaskEditorState = { mode: 'create'; date: ISODate } | { mode: 'edit'; task: Task }

interface TaskEditorDialogProps {
  state: TaskEditorState | null
  today: ISODate
  onClose: () => void
}

export function TaskEditorDialog({ state, today, onClose }: TaskEditorDialogProps) {
  const title = state?.mode === 'edit' ? 'Editar tarea' : 'Nueva tarea'

  return (
    <Dialog open={state !== null} onClose={onClose} title={title}>
      {/* Keyed so the form starts fresh every time the dialog opens. */}
      {state && (
        <TaskEditorContent
          key={state.mode === 'edit' ? state.task.id : `new-${state.date}`}
          state={state}
          today={today}
          onClose={onClose}
        />
      )}
    </Dialog>
  )
}

interface TaskEditorContentProps {
  state: TaskEditorState
  today: ISODate
  onClose: () => void
}

function TaskEditorContent({ state, today, onClose }: TaskEditorContentProps) {
  const { createTask, updateTask, deleteTask } = useTasks()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const cancelDeleteRef = useRef<HTMLButtonElement>(null)

  // The trash button disappears when asking for confirmation; move focus to
  // the safe choice so keyboard and screen reader users are not lost.
  useEffect(() => {
    if (confirmingDelete) cancelDeleteRef.current?.focus()
  }, [confirmingDelete])

  if (state.mode === 'create') {
    const initialValues: TaskInput = {
      title: '',
      note: '',
      date: state.date,
      time: null,
      priority: 'medium',
      tag: 'personal',
    }
    return (
      <TaskForm
        initialValues={initialValues}
        today={today}
        submitLabel="Añadir"
        autoFocusTitle
        onCancel={onClose}
        onSubmit={async (input) => {
          const saved = await createTask(input)
          if (saved) onClose()
          return saved
        }}
      />
    )
  }

  const { task } = state

  if (confirmingDelete) {
    return (
      <div className="space-y-4">
        <p role="alert">
          ¿Seguro que quieres borrar <strong className="break-words">«{task.title}»</strong>? No se
          puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            ref={cancelDeleteRef}
            onClick={() => {
              setConfirmingDelete(false)
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              void deleteTask(task.id).then((deleted) => {
                if (deleted) onClose()
              })
            }}
          >
            Borrar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <TaskForm
      initialValues={toTaskInput(task)}
      today={today}
      submitLabel="Guardar"
      onCancel={onClose}
      onSubmit={async (input) => {
        const saved = await updateTask(task.id, input)
        if (saved) onClose()
        return saved
      }}
      secondaryAction={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setConfirmingDelete(true)
          }}
          className="text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-400 dark:hover:bg-red-950"
          title="Borrar tarea"
        >
          <TrashIcon />
          <span className="sr-only">Borrar tarea</span>
        </Button>
      }
    />
  )
}
