import {
  BarChart3,
  CalendarDays,
  CalendarClock,
  ClipboardList,
  CreditCard,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  ListChecks,
  Route as RouteIcon,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Users,
  Workflow,
  Wallet,
  Video,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '@/data/types'
import type { DictKey } from './i18n'

export type NavItem = { id: string; path: string; label: DictKey; icon: LucideIcon }

export const PROPUESTA_ITEM: NavItem = { id: 'propuesta', path: '/propuesta', label: 'nav.propuesta', icon: FileText }

export const NAV: Record<Role, NavItem[]> = {
  admin: [
    PROPUESTA_ITEM,
    { id: 'panel', path: '/admin/panel', label: 'nav.panel', icon: LayoutDashboard },
    { id: 'usuarios', path: '/admin/usuarios', label: 'nav.usuarios', icon: Users },
    { id: 'matches', path: '/admin/matches', label: 'nav.matches', icon: SlidersHorizontal },
    { id: 'calendario', path: '/admin/calendario', label: 'nav.calendario', icon: CalendarDays },
    { id: 'pagos', path: '/admin/pagos', label: 'nav.pagos', icon: CreditCard },
    { id: 'automatizaciones', path: '/admin/automatizaciones', label: 'nav.automatizaciones', icon: Workflow },
    { id: 'roles', path: '/admin/roles', label: 'nav.roles', icon: ShieldCheck },
  ],
  psico: [
    PROPUESTA_ITEM,
    { id: 'agenda', path: '/psico/agenda', label: 'nav.agenda', icon: CalendarClock },
    { id: 'perfiles', path: '/psico/perfiles', label: 'nav.perfiles', icon: ListChecks },
    { id: 'entrevistas', path: '/psico/entrevistas', label: 'nav.entrevistas', icon: ClipboardList },
    { id: 'sugerencias', path: '/psico/sugerencias', label: 'nav.sugerencias', icon: HeartHandshake },
  ],
  user: [
    PROPUESTA_ITEM,
    { id: 'camino', path: '/mi/onboarding', label: 'nav.camino', icon: RouteIcon },
    { id: 'perfil', path: '/mi/perfil', label: 'nav.miperfil', icon: UserRound },
    { id: 'mismatches', path: '/mi/matches', label: 'nav.mismatches', icon: Sparkles },
    { id: 'entrevista', path: '/mi/entrevista', label: 'nav.mientrevista', icon: Video },
    { id: 'mispagos', path: '/mi/pagos', label: 'nav.mispagos', icon: Wallet },
  ],
}

export const DEFAULT_ROUTE: Record<Role, string> = {
  admin: '/admin/panel',
  psico: '/psico/agenda',
  user: '/mi/onboarding',
}

/** Mapa ruta→rol centralizado. /propuesta es común (null). */
export function roleForPath(path: string): Role | null {
  const p = path.split('?')[0]
  if (p.startsWith('/admin')) return 'admin'
  if (p.startsWith('/psico')) return 'psico'
  if (p.startsWith('/mi')) return 'user'
  return null
}

export const ROLE_LABEL: Record<Role, DictKey> = { admin: 'role.admin', psico: 'role.psico', user: 'role.user' }
export const ROLE_KICKER: Record<Role, DictKey> = { admin: 'kicker.admin', psico: 'kicker.psico', user: 'kicker.user' }
export const ROLE_PERSON: Record<Role, string> = {
  admin: 'Viviana',
  psico: 'Lic. Carolina Méndez',
  user: 'Martín Aguirre',
}
export const ROLE_INITIALS: Record<Role, string> = { admin: 'VI', psico: 'CM', user: 'MA' }

// íconos disponibles para otras vistas
export const ICONS = { BarChart3 }
