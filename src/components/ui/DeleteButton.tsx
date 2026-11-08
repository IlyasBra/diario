import { Button } from './Button'
import { TrashIcon } from './icons'

interface DeleteButtonProps {
  /** Accessible name, e.g. "Borrar tarea". */
  label: string
  onClick: () => void
}

export function DeleteButton({ label, onClick }: DeleteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      title={label}
      className="text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-400 dark:hover:bg-red-950"
    >
      <TrashIcon />
      <span className="sr-only">{label}</span>
    </Button>
  )
}
