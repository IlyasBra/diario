import { useUndo } from '@/features/undo/useUndo'
import { useI18n } from '@/i18n'
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
  const { t } = useI18n()
  const title = state?.mode === 'edit' ? t('reminder.editTitle') : t('reminder.new')

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
  const { createReminder, updateReminder, deleteReminder, restoreReminder } = useReminders()
  const { showUndo } = useUndo()
  const { t } = useI18n()
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
        submitLabel={t('common.add')}
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
            if (!deleted) return
            onClose()
            showUndo(t('reminder.deleted'), () => {
              void restoreReminder(reminder)
            })
          })
        }}
      />
    )
  }

  return (
    <ReminderForm
      initialValues={toReminderInput(reminder)}
      submitLabel={t('common.save')}
      onCancel={onClose}
      onSubmit={async (input) => {
        const saved = await updateReminder(reminder.id, input)
        if (saved) onClose()
        return saved
      }}
      secondaryAction={
        <DeleteButton
          label={t('reminder.deleteLabel')}
          onClick={() => {
            setConfirmingDelete(true)
          }}
        />
      }
    />
  )
}
