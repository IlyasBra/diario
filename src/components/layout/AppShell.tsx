import { type ReactNode } from 'react'

import { AppHeader } from './AppHeader'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const today = new Date()

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow dark:focus:bg-slate-800"
      >
        Saltar al contenido
      </a>
      <AppHeader today={today} />
      <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  )
}
