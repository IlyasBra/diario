import { type NavItem } from '@/components/layout/MainNav'
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
export const NAV_ITEMS: NavItem[] = [
  { id: 'hoy', label: 'Hoy', href: '#hoy', icon: <SunIcon /> },
  { id: 'proximos', label: 'Próximos', href: '#proximos', icon: <ListIcon /> },
  { id: 'calendario', label: 'Calendario', href: '#calendario', icon: <CalendarIcon /> },
  { id: 'recordatorios', label: 'Avisos', href: '#recordatorios', icon: <BellIcon /> },
  { id: 'resumen', label: 'Resumen', href: '#resumen', icon: <ChartIcon /> },
]
