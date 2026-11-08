import { useState } from 'react'

import { ConfirmDelete } from '@/components/ui/ConfirmDelete'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { Dialog } from '@/components/ui/Dialog'
import { type ISODate } from '@/lib/dates'

import { toReminderInput } from '../model'
import { useReminders } from '../state/useReminders'
import { type Reminder, type ReminderInput } from '../types'
import { ReminderForm } from './ReminderForm'

export type ReminderEditorState =
  { mode: 'create'; date: ISODate } | { mode: 'edit'; reminder: Reminder }

interface ReminderEditorDialogProps {
  state: ReminderEditorState | null
  onClose: () => void
}

export function ReminderEditorDialog({ state, onClose }: ReminderEditorDialogProps) {
  const title = state?.mode === 'edit' ? 'Editar recordatorio' : 'Nuevo recordatorio'

  return (
    <Dialog open={state !== null} onClose={onClose} title={title}>
      {state && (
        <ReminderEditorContent
          key={state.mode === 'edit' ? state.reminder.id : `new-${state.date}`}
          state={state}
          onClose={onClose}
        />
      )}
    </Dialog>
  )
}

function ReminderEditorContent({
  state,
  onClose,
}: {
  state: ReminderEditorState
  onClose: () => void
}) {
  const { createReminder, updateReminder, deleteReminder } = useReminders()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (state.mode === 'create') {
    const initialValues: ReminderInput = {
      title: '',
      note: '',
      date: state.date,
      time: '09:00',
      repeat: 'none',
    }
    return (
      <ReminderForm
        initialValues={initialValues}
        submitLabel="Añadir"
        autoFocusTitle
        onCancel={onClose}
        onSubmit={async (input) => {
          const saved = await createReminder(input)
          if (saved) onClose()
          return saved
        }}
      />
    )
  }

  const { reminder } = state

  if (confirmingDelete) {
    return (
      <ConfirmDelete
        itemName={reminder.title}
        onCancel={() => {
          setConfirmingDelete(false)
        }}
        onConfirm={() => {
          void deleteReminder(reminder.id).then((deleted) => {
            if (deleted) onClose()
          })
        }}
      />
    )
  }

  return (
    <ReminderForm
      initialValues={toReminderInput(reminder)}
      submitLabel="Guardar"
      onCancel={onClose}
      onSubmit={async (input) => {
        const saved = await updateReminder(reminder.id, input)
        if (saved) onClose()
        return saved
      }}
      secondaryAction={
        <DeleteButton
          label="Borrar recordatorio"
          onClick={() => {
            setConfirmingDelete(true)
          }}
        />
      }
    />
  )
}
