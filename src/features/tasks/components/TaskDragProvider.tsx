import {
  type Announcements,
  type DragEndEvent,
  DndContext,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useDndContext,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { type ReactNode, useRef } from 'react'

import { useUndo } from '@/features/undo/useUndo'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import {
  addDaysToISODate,
  formatDayHeading,
  formatWeekday,
  type ISODate,
  parseISODate,
} from '@/lib/dates'

import { resolveTaskMove } from '../dragging'
import { useTasks } from '../state/useTasks'

const TARGET_DAYS = 7

interface TaskDragProviderProps {
  today: ISODate
  children: ReactNode
}

/**
 * Lets the user drag a task by its handle onto a day. While dragging, a bar
 * with the next seven days appears at the bottom of the screen as drop targets.
 */
export function TaskDragProvider({ today, children }: TaskDragProviderProps) {
  const { t } = useI18n()
  const { tasks, updateTask } = useTasks()
  const { showUndo } = useUndo()
  const handledDrags = useRef(new WeakSet<Event>())
  // The handle has touch-action: none, so touch drags start immediately and
  // do not fight with scrolling elsewhere in the list.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 6 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    console.warn('DBG dragEnd', Date.now(), event.over?.id)
    // A drag must move the task once, even if the end event is delivered twice.
    if (handledDrags.current.has(event.activatorEvent)) return
    handledDrags.current.add(event.activatorEvent)

    const target = event.over ? String(event.over.id) : null
    const move = resolveTaskMove(tasks, String(event.active.id), target)
    if (!move) return

    void updateTask(move.taskId, { date: move.to })
    showUndo(t('task.movedTo', { day: formatDayHeading(move.to, today).toLowerCase() }), () => {
      console.warn('DBG undo', Date.now())
      void updateTask(move.taskId, { date: move.from })
    })
  }

  // Screen reader messages (the library's defaults are in English).
  const titleOf = (id: string | number) =>
    tasks.find((task) => task.id === String(id))?.title ?? t('drag.theTask')
  const dayOf = (id: string | number | undefined) =>
    id === undefined ? t('drag.noDay') : formatDayHeading(String(id), today).toLowerCase()
  const announcements: Announcements = {
    onDragStart: ({ active }) => t('drag.start', { title: titleOf(active.id) }),
    onDragOver: ({ active, over }) =>
      over ? t('drag.over', { title: titleOf(active.id), day: dayOf(over.id) }) : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? t('drag.dropped', { title: titleOf(active.id), day: dayOf(over.id) })
        : t('drag.outside', { title: titleOf(active.id) }),
    onDragCancel: ({ active }) => t('drag.cancel', { title: titleOf(active.id) }),
  }

  return (
    <DndContext
      sensors={sensors}
      // The day under the finger or cursor wins; the default compares the dragged
      // card (as wide as the screen) with the targets and picks one far from the pointer.
      collisionDetection={pointerWithin}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable: t('drag.instructions'),
        },
      }}
    >
      {children}
      <DayTargets today={today} />
    </DndContext>
  )
}

function DayTargets({ today }: { today: ISODate }) {
  const { t } = useI18n()
  const { active } = useDndContext()
  if (!active) return null

  const days = Array.from({ length: TARGET_DAYS }, (_, index) => addDaysToISODate(today, index))

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur md:bottom-0 dark:border-slate-700 dark:bg-slate-900/95"
    >
      <p className="mb-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
        {t('drag.drop')}
      </p>
      <ul className="mx-auto flex max-w-2xl gap-2 overflow-x-auto">
        {days.map((day) => (
          <DayTarget key={day} day={day} today={today} />
        ))}
      </ul>
    </div>
  )
}

function DayTarget({ day, today }: { day: ISODate; today: ISODate }) {
  const { t } = useI18n()
  const { setNodeRef, isOver } = useDroppable({ id: day })
  const date = parseISODate(day)
  const label =
    day === today ? t('day.today') : day === addDaysToISODate(today, 1) ? t('day.tomorrow') : null

  return (
    <li
      ref={setNodeRef}
      className={cn(
        'flex h-16 min-w-16 flex-1 flex-col items-center justify-center rounded-xl text-sm font-medium ring-1 transition-colors',
        isOver
          ? 'bg-brand-600 text-white ring-brand-600'
          : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700',
      )}
    >
      <span className="first-letter:uppercase">{label ?? formatWeekday(date, 'short')}</span>
      <span className="text-lg tabular-nums">{date.getDate()}</span>
    </li>
  )
}
