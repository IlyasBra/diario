import { useState } from 'react'

import { ConfirmDelete } from '@/components/ui/ConfirmDelete'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { Dialog } from '@/components/ui/Dialog'
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
      <ConfirmDelete
        itemName={task.title}
        onCancel={() => {
          setConfirmingDelete(false)
        }}
        onConfirm={() => {
          void deleteTask(task.id).then((deleted) => {
            if (deleted) onClose()
          })
        }}
      />
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
        <DeleteButton
          label="Borrar tarea"
          onClick={() => {
            setConfirmingDelete(true)
          }}
        />
      }
    />
  )
}
