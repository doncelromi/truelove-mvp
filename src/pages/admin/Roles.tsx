import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Check, KeyRound, Minus, ShieldCheck, UserPlus } from 'lucide-react'
import { PreviewBanner } from '@/components/Notices'
import { Badge, CardHeader, PageHeader, Tabs } from '@/components/ui'
import { PSICOLOGAS } from '@/data/members'
import type { AuditLog } from '@/data/types'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

type Perm = 'full' | 'own' | 'none'
const SECTIONS: { es: string; en: string; p: [Perm, Perm, Perm] }[] = [
  { es: 'Panel y métricas', en: 'Dashboard & metrics', p: ['full', 'none', 'none'] },
  { es: 'Usuarios y estados', en: 'Members & statuses', p: ['full', 'own', 'none'] },
  { es: 'Aprobar / rechazar perfiles', en: 'Approve / reject profiles', p: ['full', 'own', 'none'] },
  { es: 'Motor de matches (configuración)', en: 'Match engine (settings)', p: ['full', 'none', 'none'] },
  { es: 'Sugerir matches manuales', en: 'Suggest manual matches', p: ['full', 'full', 'none'] },
  { es: 'Calendario de entrevistas', en: 'Interview calendar', p: ['full', 'own', 'own'] },
  { es: 'Notas y etiquetas de entrevista', en: 'Interview notes & tags', p: ['full', 'own', 'none'] },
  { es: 'Pagos y reembolsos', en: 'Payments & refunds', p: ['full', 'none', 'own'] },
  { es: 'Automatizaciones', en: 'Automations', p: ['full', 'none', 'none'] },
  { es: 'Perfil propio, fotos y música', en: 'Own profile, photos & music', p: ['full', 'own', 'own'] },
  { es: 'Roles y auditoría', en: 'Roles & audit', p: ['full', 'none', 'none'] },
]

const TIPO_TONE: Record<AuditLog['tipo'], 'accent' | 'blue' | 'red' | 'green' | 'gray'> = { perfil: 'green', motor: 'accent', acceso: 'red', pago: 'blue', config: 'gray' }
const TIPO_LABEL: Record<AuditLog['tipo'], [string, string]> = {
  perfil: ['Perfil', 'Profile'],
  motor: ['Motor', 'Engine'],
  acceso: ['Acceso', 'Access'],
  pago: ['Pago', 'Payment'],
  config: ['Configuración', 'Settings'],
}

export default function Roles() {
  const tr = useTr()
  const { lang } = useLang()
  const { audit, members } = useStore()
  const [filter, setFilter] = useState<'todos' | AuditLog['tipo']>('todos')
  const [perms, setPerms] = useState(SECTIONS.map((s) => [...s.p] as Perm[]))

  const cycle = (i: number, j: number) => {
    if (j === 0) {
      toast(tr('La administradora siempre tiene acceso total.', 'The administrator always has full access.'))
      return
    }
    setPerms((p) => p.map((row, k) => (k === i ? row.map((v, l) => (l === j ? (v === 'full' ? 'own' : v === 'own' ? 'none' : 'full') : v)) : row)))
    toast.success(tr('Permiso actualizado y registrado en auditoría', 'Permission updated and recorded in the audit log'))
  }

  const team = [
    { nombre: 'Viviana', rol: tr('Administradora · Dueña', 'Administrator · Owner'), email: 'viviana@yomequierocasar.demo', color: 'var(--accent)', n: members.length },
    ...PSICOLOGAS.map((p) => ({ nombre: p.nombre, rol: tr('Psicóloga', 'Psychologist'), email: p.email, color: p.color, n: members.filter((m) => m.psicologaId === p.id).length })),
  ]
  const logs = audit.filter((a) => filter === 'todos' || a.tipo === filter)

  return (
    <div>
      <PageHeader title={tr('Roles y auditoría', 'Roles & audit')} subtitle={tr('CRM multiusuario: quién puede ver y hacer qué, y el registro de cada cambio.', 'Multi-user CRM: who can see and do what, plus a record of every change.')} />
      <PreviewBanner
        id="admin-roles"
        bullets={[
          tr('Tres roles con permisos propios y un panel distinto para cada uno.', 'Three roles with their own permissions and a different dashboard each.'),
          tr('Permisos granulares por sección.', 'Granular permissions per section.'),
          tr('Historial de accesos y auditoría de cada cambio.', 'Access history and audit trail of every change.'),
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="card min-w-0">
          <CardHeader title={tr('Matriz de permisos', 'Permission matrix')} subtitle={tr('Clic en una celda para cambiar el permiso', 'Click a cell to change the permission')} right={<ShieldCheck className="h-4 w-4 text-accent" />} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-surface-2">
                <tr>
                  <th className="label-xs px-4 py-2.5 text-left">{tr('Sección', 'Section')}</th>
                  <th className="label-xs px-3 py-2.5">{tr('Administradora', 'Administrator')}</th>
                  <th className="label-xs px-3 py-2.5">{tr('Psicóloga', 'Psychologist')}</th>
                  <th className="label-xs px-3 py-2.5">{tr('Usuario', 'Member')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SECTIONS.map((s, i) => (
                  <tr key={s.es}>
                    <td className="px-4 py-2.5">{s[lang]}</td>
                    {perms[i].map((p, j) => (
                      <td key={j} className="px-3 py-2 text-center">
                        <button onClick={() => cycle(i, j)} className={cn('chip ring-1 ring-inset', p === 'full' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400' : p === 'own' ? 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-zinc-100 text-zinc-500 ring-zinc-500/20 dark:bg-zinc-500/10')}>
                          {p === 'full' ? <Check className="h-3 w-3" /> : p === 'own' ? <KeyRound className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                          {p === 'full' ? tr('Total', 'Full') : p === 'own' ? tr('Solo propios', 'Own only') : tr('Sin acceso', 'No access')}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card h-fit">
          <CardHeader
            title={tr('Equipo', 'Team')}
            right={
              <button className="btn-outline btn-sm" onClick={() => toast(tr('Invitación enviada (demo)', 'Invitation sent (demo)'))}>
                <UserPlus className="h-3.5 w-3.5" /> {tr('Invitar', 'Invite')}
              </button>
            }
          />
          <ul className="divide-y divide-border">
            {team.map((p) => (
              <li key={p.email} className="flex items-center gap-3 px-5 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: p.color }}>
                  {p.nombre.replace('Lic. ', '').split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.nombre}</p>
                  <p className="truncate text-xs text-muted">{p.rol} · {p.email}</p>
                </div>
                <span className="text-right text-xs text-muted"><span className="num block text-sm text-fg">{p.n}</span>{tr('miembros', 'members')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-3">
          <p className="px-2 text-[15px] font-semibold">{tr('Auditoría', 'Audit log')}</p>
          <Tabs
            value={filter}
            onChange={setFilter}
            items={[
              { value: 'todos', label: tr('Todo', 'All'), count: audit.length },
              ...(Object.keys(TIPO_LABEL) as AuditLog['tipo'][]).map((k) => ({ value: k, label: tr(TIPO_LABEL[k][0], TIPO_LABEL[k][1]) })),
            ]}
          />
        </div>
        <ul className="divide-y divide-border">
          {logs.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2.5 text-sm">
              <Badge tone={TIPO_TONE[l.tipo]} className="w-24 justify-center">{tr(TIPO_LABEL[l.tipo][0], TIPO_LABEL[l.tipo][1])}</Badge>
              <span className="font-medium">{l.actor === 'Sistema' ? tr('Sistema', 'System') : l.actor}</span>
              <span className="min-w-0 flex-1 text-muted">{l.accion[lang]}</span>
              <span className="num text-xs text-muted">{format(new Date(l.fecha), 'd MMM · HH:mm', { locale: dateLocale(lang) })}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
