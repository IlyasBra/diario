import { useDraggable } from '@dnd-kit/core'

import { Button } from '@/components/ui/Button'
import { GripIcon } from '@/components/ui/icons'
import { useI18n } from '@/i18n'
import { type ISODate } from '@/lib/dates'

import { type Task } from '../types'
import { TaskItem, type TaskItemActions } from './TaskItem'

interface DraggableTaskItemProps extends TaskItemActions {
  task: Task
  today: ISODate
}

/** A TaskItem with a handle to drag it onto another day. */
export function DraggableTaskItem(props: DraggableTaskItemProps) {
  const { t } = useI18n()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.task.id,
  })

  return (
    <TaskItem
      {...props}
      rootRef={setNodeRef}
      rootStyle={{
        transform: transform
          ? `translate3d(${String(transform.x)}px, ${String(transform.y)}px, 0)`
          : undefined,
        position: isDragging ? 'relative' : undefined,
        zIndex: isDragging ? 40 : undefined,
      }}
      isDragging={isDragging}
      handle={
        <Button
          variant="ghost"
          size="icon"
          // touch-action: none lets the finger drag the item instead of scrolling the page.
          className="-my-1 -ms-2 cursor-grab touch-none"
          {...attributes}
          {...listeners}
        >
          <GripIcon />
          <span className="sr-only">{t('task.moveSr', { title: props.task.title })}</span>
        </Button>
      }
    />
  )
}
