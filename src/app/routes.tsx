import { type NavItem } from '@/components/layout/MainNav'
import { type MessageKey } from '@/i18n'
import { BellIcon, CalendarIcon, ChartIcon, ListIcon, SunIcon } from '@/components/ui/icons'

/** Hash routes. The values appear in the URL, so they are in Spanish. */
export const ROUTES = [
  'hoy',
  'proximos',
  'calendario',
  'recordatorios',
  'resumen',
  'buscar',
] as const
export type Route = (typeof ROUTES)[number]

export const DEFAULT_ROUTE: Route = 'hoy'

/** Sections shown in the bottom bar. "buscar" is reached from the header. */
export function navItems(t: (key: MessageKey) => string): NavItem[] {
  return [
    { id: 'hoy', label: t('nav.today'), href: '#hoy', icon: <SunIcon /> },
    { id: 'proximos', label: t('nav.upcoming'), href: '#proximos', icon: <ListIcon /> },
    { id: 'calendario', label: t('nav.calendar'), href: '#calendario', icon: <CalendarIcon /> },
    { id: 'recordatorios', label: t('nav.reminders'), href: '#recordatorios', icon: <BellIcon /> },
    { id: 'resumen', label: t('nav.stats'), href: '#resumen', icon: <ChartIcon /> },
  ]
}
