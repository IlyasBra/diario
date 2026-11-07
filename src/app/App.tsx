import { AppShell } from '@/components/layout/AppShell'

export function App() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Hoy</h1>
      <section
        aria-label="Tareas de hoy"
        className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-slate-700 dark:text-slate-400"
      >
        <p>Aquí aparecerán tus tareas del día.</p>
      </section>
    </AppShell>
  )
}
