import { type TagColor } from './types'

/**
 * Tailwind only generates classes it finds as complete strings in the source,
 * so every colour is spelled out here instead of being built dynamically.
 */
export const TAG_COLOR_CLASSES: Record<TagColor, { badge: string; swatch: string }> = {
  slate: {
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    swatch: 'bg-slate-500',
  },
  red: {
    badge: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    swatch: 'bg-red-500',
  },
  amber: {
    badge: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
    swatch: 'bg-amber-500',
  },
  green: {
    badge: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    swatch: 'bg-green-500',
  },
  teal: {
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200',
    swatch: 'bg-teal-500',
  },
  blue: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    swatch: 'bg-blue-500',
  },
  violet: {
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
    swatch: 'bg-violet-500',
  },
  pink: {
    badge: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200',
    swatch: 'bg-pink-500',
  },
}

export const TAG_COLOR_LABELS: Record<TagColor, string> = {
  slate: 'Gris',
  red: 'Rojo',
  amber: 'Ámbar',
  green: 'Verde',
  teal: 'Turquesa',
  blue: 'Azul',
  violet: 'Violeta',
  pink: 'Rosa',
}
