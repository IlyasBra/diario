import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import { PencilIcon, TrashIcon } from '@/components/ui/icons'
import { useTasks } from '@/features/tasks/state/useTasks'

import { useTags } from '../state/useTags'
import { FALLBACK_TAG_ID, type Tag } from '../types'
import { TagBadge } from './TagBadge'
import { TagForm } from './TagForm'

/** Create, rename, recolour and delete tags. Used inside the settings dialog. */
export function TagsSection() {
  const { tags, createTag, updateTag, deleteTag, error, dismissError } = useTags()
  const { tasks, updateTask } = useTasks()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Tag | null>(null)

  async function confirmDelete(tag: Tag) {
    // Tasks of the deleted tag move to the fallback one, so none is left uncategorised.
    const affected = tasks.filter((task) => task.tag === tag.id)
    for (const task of affected) await updateTask(task.id, { tag: FALLBACK_TAG_ID })
    await deleteTag(tag.id)
    setDeleting(null)
  }

  return (
    <section aria-labelledby="tags-heading" className="space-y-3">
      <h3 id="tags-heading" className="text-base font-semibold">
        Etiquetas
      </h3>
      {error && (
        <Notice tone="error" onDismiss={dismissError}>
          {error}
        </Notice>
      )}

      <ul className="space-y-2">
        {tags.map((tag) => (
          <li key={tag.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
            {editingId === tag.id ? (
              <TagForm
                initialValues={{ name: tag.name, color: tag.color }}
                otherTags={tags.filter((other) => other.id !== tag.id)}
                submitLabel="Guardar"
                onCancel={() => {
                  setEditingId(null)
                }}
                onSubmit={async (input) => {
                  const saved = await updateTag(tag.id, input)
                  if (saved) setEditingId(null)
                  return saved
                }}
              />
            ) : deleting?.id === tag.id ? (
              <div className="space-y-3">
                <p className="text-sm">
                  ¿Borrar «{tag.name}»?{' '}
                  {tasks.some((task) => task.tag === tag.id)
                    ? 'Sus tareas pasarán a «Otros».'
                    : 'No tiene tareas.'}
                </p>
                <div className="flex gap-2">
                  <Button variant="danger" onClick={() => void confirmDelete(tag)}>
                    Borrar etiqueta
                  </Button>
                  <Button
                    onClick={() => {
                      setDeleting(null)
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <TagBadge tagId={tag.id} />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingId(tag.id)
                  }}
                >
                  <PencilIcon />
                  <span className="sr-only">Editar etiqueta «{tag.name}»</span>
                </Button>
                {tag.id !== FALLBACK_TAG_ID && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setDeleting(tag)
                    }}
                  >
                    <TrashIcon />
                    <span className="sr-only">Borrar etiqueta «{tag.name}»</span>
                  </Button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="rounded-xl p-3 ring-1 ring-slate-200 dark:ring-slate-700">
        <h4 className="mb-2 text-sm font-medium">Nueva etiqueta</h4>
        <TagForm
          initialValues={{ name: '', color: 'teal' }}
          otherTags={tags}
          submitLabel="Añadir etiqueta"
          onSubmit={createTag}
        />
      </div>
    </section>
  )
}
