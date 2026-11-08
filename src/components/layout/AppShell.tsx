import { type ReactNode } from 'react'

import { type ISODate } from '@/lib/dates'

import { AppHeader } from './AppHeader'

interface AppShellProps {
  today: ISODate
  /** Main navigation: bottom bar on phones, under the header on desktop. */
  nav?: ReactNode
  children: ReactNode
}

export function AppShell({ today, nav, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow dark:focus:bg-slate-800"
      >
        Saltar al contenido
      </a>
      <AppHeader today={today} />
      {nav}
      {/* Bottom padding leaves room for the fixed bottom bar and the + button. */}
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6 pb-40 focus:outline-none md:pb-12"
      >
        {children}
      </main>
    </div>
  )
}
