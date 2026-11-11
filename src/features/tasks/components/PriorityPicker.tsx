import { type SegmentedOption, SegmentedControl } from '@/components/ui/SegmentedControl'
import { useI18n } from '@/i18n'

import { priorityLabel } from '../labels'
import { type Priority } from '../types'

const SELECTED_CLASSES: Record<Priority, string> = {
  high: 'peer-checked:bg-red-600 peer-checked:text-white',
  medium: 'peer-checked:bg-amber-500 peer-checked:text-slate-950',
  low: 'peer-checked:bg-sky-600 peer-checked:text-white',
}

const PRIORITIES: readonly Priority[] = ['high', 'medium', 'low']

interface PriorityPickerProps {
  value: Priority
  onChange: (value: Priority) => void
}

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  const { t } = useI18n()
  const options: SegmentedOption<Priority>[] = PRIORITIES.map((priority) => ({
    value: priority,
    label: priorityLabel(priority),
    selectedClassName: SELECTED_CLASSES[priority],
  }))

  return (
    <SegmentedControl
      legend={t('priority.legend')}
      options={options}
      value={value}
      onChange={onChange}
    />
  )
}
