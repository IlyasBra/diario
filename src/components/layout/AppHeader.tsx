import { type ReactNode } from 'react'

import { formatLongDate, type ISODate, parseISODate } from '@/lib/dates'

interface AppHeaderProps {
  today: ISODate
  actions?: ReactNode
}

export function AppHeader({ today, actions }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4">
        <img
          src={`${import.meta.env.BASE_URL}favicon.svg`}
          alt="Diario"
          width={36}
          height={36}
          className="size-9"
        />
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-600 first-letter:uppercase dark:text-slate-400">
            <time dateTime={today}>{formatLongDate(parseISODate(today))}</time>
          </p>
          {actions}
        </div>
      </div>
    </header>
  )
}
