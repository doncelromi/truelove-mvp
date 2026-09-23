import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { Check, Search, X } from 'lucide-react'
import { MemberPhoto } from '@/components/MemberPhoto'
import { RejectModal } from '@/components/MemberSections'
import { PreviewBanner } from '@/components/Notices'
import { PageHeader, PagoBadge, StatusBadge, Tabs, Empty } from '@/components/ui'
import { CIUDADES, PROFESIONES } from '@/data/catalog'
import { PSICOLOGAS, psicoById } from '@/data/members'
import type { Member, MemberStatus } from '@/data/types'
import { useMemberActions } from '@/lib/actions'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { useStore } from '@/lib/store'

type Tab = 'todos' | MemberStatus

export default function Usuarios() {
  const tr = useTr()
  const { lang } = useLang()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { members } = useStore()
  const { approve } = useMemberActions()
  const tab = (params.get('tab') as Tab) || 'todos'
  const [q, setQ] = useState('')
  const [psico, setPsico] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [rejecting, setRejecting] = useState<Member | null>(null)

  const count = (s: MemberStatus) => members.filter((m) => m.estado === s).length
  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: 'todos', label: tr('Todos', 'All'), count: members.length },
    { value: 'incompleto', label: tr('Incompletos', 'Incomplete'), count: count('incompleto') },
    { value: 'pendiente', label: tr('Pendientes', 'Pending'), count: count('pendiente') },
    { value: 'aprobado', label: tr('Aprobados', 'Approved'), count: count('aprobado') },
    { value: 'rechazado', label: tr('Rechazados', 'Rejected'), count: count('rechazado') },
    { value: 'pausa', label: tr('En pausa', 'Paused'), count: count('pausa') },
  ]

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return members.filter(
      (m) =>
        (tab === 'todos' || m.estado === tab) &&
        (!psico || m.psicologaId === psico) &&
        (!ciudad || m.ciudad === ciudad) &&
        (!s || `${m.nombre} ${m.apellido} ${m.ciudad}`.toLowerCase().includes(s)),
    )
  }, [members, tab, psico, ciudad, q])

  const setTab = (t: Tab) => setParams(t === 'todos' ? {} : { tab: t }, { replace: true })

  return (
    <div>
      <PageHeader
        title={tr('Usuarios', 'Members')}
        subtitle={tr('Todos los candidatos y miembros de la agencia, por estado de validación.', 'All agency candidates and members, by validation status.')}
      />
      <PreviewBanner
        id="admin-usuarios"
        bullets={[
          tr('Cada candidato crea su cuenta y aparece acá con su estado.', 'Each candidate creates their account and appears here with their status.'),
          tr('Aprobás, rechazás con motivo (con reembolso) o pausás en un clic.', 'Approve, reject with a reason (with refund) or pause in one click.'),
          tr('Ficha completa: fotos, canciones, valores, cuestionario y notas.', 'Full profile: photos, songs, values, questionnaire and notes.'),
        ]}
      />
      <div data-trailer="users-tabs"><Tabs value={tab} onChange={setTab} items={tabs} /></div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder={tr('Buscar por nombre o ciudad…', 'Search by name or city…')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input sm:w-56" value={psico} onChange={(e) => setPsico(e.target.value)}>
          <option value="">{tr('Todas las psicólogas', 'All psychologists')}</option>
          {PSICOLOGAS.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <select className="input sm:w-44" value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
          <option value="">{tr('Todas las ciudades', 'All cities')}</option>
          {Object.keys(CIUDADES).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="card mt-4 overflow-hidden">
        {/* Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-2">
              <tr className="text-left">
                <th className="label-xs px-4 py-2.5">{tr('Miembro', 'Member')}</th>
                <th className="label-xs px-3 py-2.5">{tr('Edad', 'Age')}</th>
                <th className="label-xs px-3 py-2.5">{tr('Ciudad', 'City')}</th>
                <th className="label-xs px-3 py-2.5">{tr('Profesión', 'Profession')}</th>
                <th className="label-xs px-3 py-2.5">{tr('Estado', 'Status')}</th>
                <th className="label-xs px-3 py-2.5">{tr('Pago', 'Payment')}</th>
                <th className="label-xs px-3 py-2.5">{tr('Psicóloga', 'Psychologist')}</th>
                <th className="label-xs px-3 py-2.5">{tr('Alta', 'Joined')}</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((m) => (
                <tr key={m.id} className="cursor-pointer hover:bg-surface-2" onClick={() => navigate(`/admin/usuarios/${m.id}`)}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <MemberPhoto member={m} size="sm" />
                      <span className="font-medium">{m.nombre} {m.apellido}</span>
                    </div>
                  </td>
                  <td className="num px-3 py-2.5">{m.edad}</td>
                  <td className="px-3 py-2.5">{m.ciudad}</td>
                  <td className="px-3 py-2.5 text-muted">{PROFESIONES[m.profesion]?.[lang]}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={m.estado} /></td>
                  <td className="px-3 py-2.5"><PagoBadge pago={m.pago} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted">{psicoById(m.psicologaId).nombre.replace('Lic. ', '')}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted">{format(new Date(m.fechaAlta), 'd MMM', { locale: dateLocale(lang) })}</td>
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    {m.estado === 'pendiente' && (
                      <div className="flex gap-1">
                        <button className="rounded-md p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10" title={tr('Aprobar', 'Approve')} onClick={() => approve(m)}>
                          <Check className="h-4 w-4" />
                        </button>
                        <button className="rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" title={tr('Rechazar', 'Reject')} onClick={() => setRejecting(m)}>
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile */}
        <ul className="divide-y divide-border md:hidden">
          {list.map((m) => (
            <li key={m.id} className="flex items-center gap-3 p-3" onClick={() => navigate(`/admin/usuarios/${m.id}`)}>
              <MemberPhoto member={m} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{m.nombre} {m.apellido}, <span className="num">{m.edad}</span></p>
                <p className="truncate text-xs text-muted">{PROFESIONES[m.profesion]?.[lang]} · {m.ciudad}</p>
                <div className="mt-1 flex gap-1"><StatusBadge status={m.estado} /><PagoBadge pago={m.pago} /></div>
              </div>
            </li>
          ))}
        </ul>
        {list.length === 0 && <Empty text={tr('No hay miembros con esos filtros.', 'No members match these filters.')} />}
      </div>
      <p className="mt-2 text-xs text-muted">{tr(`${list.length} miembros`, `${list.length} members`)}</p>
      <RejectModal member={rejecting} open={!!rejecting} onOpenChange={(v) => !v && setRejecting(null)} />
    </div>
  )
}
