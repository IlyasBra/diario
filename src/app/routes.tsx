import { type NavItem } from '@/components/layout/MainNav'
import { BellIcon, CalendarIcon, SunIcon } from '@/components/ui/icons'

/** Hash routes. The values appear in the URL, so they are in Spanish. */
export const ROUTES = ['hoy', 'proximos', 'recordatorios', 'buscar'] as const
export type Route = (typeof ROUTES)[number]

export const DEFAULT_ROUTE: Route = 'hoy'

/** Sections shown in the bottom bar. "buscar" is reached from the header. */
export const NAV_ITEMS: NavItem[] = [
  { id: 'hoy', label: 'Hoy', href: '#hoy', icon: <SunIcon /> },
  { id: 'proximos', label: 'Próximos', href: '#proximos', icon: <CalendarIcon /> },
  { id: 'recordatorios', label: 'Recordatorios', href: '#recordatorios', icon: <BellIcon /> },
]
