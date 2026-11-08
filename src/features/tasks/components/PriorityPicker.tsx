import { type SegmentedOption, SegmentedControl } from '@/components/ui/SegmentedControl'

import { PRIORITY_LABELS } from '../labels'
import { type Priority } from '../types'

const OPTIONS: SegmentedOption<Priority>[] = [
  {
    value: 'high',
    label: PRIORITY_LABELS.high,
    selectedClassName: 'peer-checked:bg-red-600 peer-checked:text-white',
  },
  {
    value: 'medium',
    label: PRIORITY_LABELS.medium,
    selectedClassName: 'peer-checked:bg-amber-500 peer-checked:text-slate-950',
  },
  {
    value: 'low',
    label: PRIORITY_LABELS.low,
    selectedClassName: 'peer-checked:bg-sky-600 peer-checked:text-white',
  },
]

interface PriorityPickerProps {
  value: Priority
  onChange: (value: Priority) => void
}

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  return <SegmentedControl legend="Prioridad" options={OPTIONS} value={value} onChange={onChange} />
}
