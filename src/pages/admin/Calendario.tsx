import { useState } from 'react'
import { addMonths, addWeeks, endOfWeek, format, isWithinInterval, startOfWeek } from 'date-fns'
import { CalendarX2, ChevronLeft, ChevronRight } from 'lucide-react'
import { MonthCalendar, WeekCalendar } from '@/components/Calendar'
import { InterviewModal } from '@/components/InterviewModal'
import { MemberPhoto } from '@/components/MemberPhoto'
import { PreviewBanner } from '@/components/Notices'
import { CardHeader, Empty, PageHeader, Tabs } from '@/components/ui'
import { PSICOLOGAS, psicoById } from '@/data/members'
import type { Interview } from '@/data/types'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function Calendario() {
  const tr = useTr()
  const { lang } = useLang()
  const { interviews, byId } = useStore()
  const [view, setView] = useState<'semana' | 'mes'>('semana')
  const [anchor, setAnchor] = useState(new Date())
  const [psicos, setPsicos] = useState<string[]>(PSICOLOGAS.map((p) => p.id))
  const [sel, setSel] = useState<Interview | null>(null)

  const list = interviews.filter((i) => psicos.includes(i.psicologaId))
  const cancel = interviews.filter((i) => i.estado === 'cancelada')
  const move = (dir: number) => setAnchor((a) => (view === 'semana' ? addWeeks(a, dir) : addMonths(a, dir)))
  const ws = startOfWeek(anchor, { weekStartsOn: 1 })
  const weekCount = list.filter((i) => isWithinInterval(new Date(i.fecha), { start: ws, end: endOfWeek(anchor, { weekStartsOn: 1 }) })).length
  const label =
    view === 'semana'
      ? `${format(ws, 'd MMM', { locale: dateLocale(lang) })} – ${format(endOfWeek(anchor, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: dateLocale(lang) })}`
      : format(anchor, 'MMMM yyyy', { locale: dateLocale(lang) })

  return (
    <div>
      <PageHeader title={tr('Calendario de entrevistas', 'Interview calendar')} subtitle={tr('Los turnos de las tres psicólogas en un solo lugar.', 'All three psychologists’ appointments in one place.')} />
      <PreviewBanner
        id="admin-calendario"
        bullets={[
          tr('El candidato pide su turno y se confirma automáticamente.', 'Candidates book and get confirmed automatically.'),
          tr('Recordatorio 24h antes a candidato y psicóloga.', '24h reminder to candidate and psychologist.'),
          tr('Alertas de cancelación y reprogramación en un clic.', 'Cancellation alerts and one-click rescheduling.'),
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="card">
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
            <Tabs value={view} onChange={setView} items={[{ value: 'semana', label: tr('Semana', 'Week') }, { value: 'mes', label: tr('Mes', 'Month') }]} />
            <div className="flex items-center gap-1">
              <button className="btn-ghost h-8 w-8 px-0" onClick={() => move(-1)} aria-label="prev"><ChevronLeft className="h-4 w-4" /></button>
              <button className="btn-outline btn-sm" onClick={() => setAnchor(new Date())}>{tr('Hoy', 'Today')}</button>
              <button className="btn-ghost h-8 w-8 px-0" onClick={() => move(1)} aria-label="next"><ChevronRight className="h-4 w-4" /></button>
            </div>
            <p className="text-sm font-semibold capitalize">{label}</p>
            {view === 'semana' && <span className="text-xs text-muted">· {weekCount} {tr('turnos', 'appointments')}</span>}
            <div className="ml-auto flex flex-wrap gap-1.5">
              {PSICOLOGAS.map((p) => {
                const on = psicos.includes(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => setPsicos((s) => (on ? s.filter((x) => x !== p.id) : [...s, p.id]))}
                    className={cn('chip border transition-opacity', on ? 'border-border' : 'border-dashed border-border opacity-45')}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: p.color }} /> {p.nombre.replace('Lic. ', '')}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="p-3">
            {view === 'semana' ? (
              <WeekCalendar anchor={anchor} interviews={list} onSelect={setSel} colorMode="psico" />
            ) : (
              <MonthCalendar anchor={anchor} interviews={list} onSelect={setSel} colorMode="psico" />
            )}
          </div>
        </div>
        <div className="card h-fit">
          <CardHeader title={tr('Cancelaciones', 'Cancellations')} subtitle={tr('Turnos cancelados por los candidatos', 'Appointments cancelled by candidates')} right={<CalendarX2 className="h-4 w-4 text-red-500" />} />
          {cancel.length === 0 ? (
            <Empty text={tr('Sin cancelaciones', 'No cancellations')} />
          ) : (
            <ul className="divide-y divide-border">
              {cancel.map((iv) => {
                const m = byId(iv.memberId)!
                return (
                  <li key={iv.id}>
                    <button className="flex w-full items-center gap-3 p-3 text-left hover:bg-surface-2" onClick={() => setSel(iv)}>
                      <MemberPhoto member={m} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{m.nombre} {m.apellido}</p>
                        <p className="text-xs text-muted">{format(new Date(iv.fecha), "EEE d MMM · HH:mm", { locale: dateLocale(lang) })} · {psicoById(iv.psicologaId).nombre.replace('Lic. ', '')}</p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      <InterviewModal iv={sel} onClose={() => setSel(null)} />
    </div>
  )
}
