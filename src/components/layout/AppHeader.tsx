import { formatLongDate, type ISODate, parseISODate } from '@/lib/dates'

interface AppHeaderProps {
  today: ISODate
}

export function AppHeader({ today }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-2xl items-baseline justify-between gap-4 px-4 py-4">
        <p className="text-xl font-semibold tracking-tight">Diario</p>
        <p className="text-sm text-slate-600 first-letter:uppercase dark:text-slate-400">
          <time dateTime={today}>{formatLongDate(parseISODate(today))}</time>
        </p>
      </div>
    </header>
  )
}
