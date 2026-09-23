import { useState } from 'react'
import { addMonths, addWeeks, format, isSameDay } from 'date-fns'
import { toast } from 'sonner'
import { CalendarX2, ChevronLeft, ChevronRight, MapPin, Video } from 'lucide-react'
import { MonthCalendar, WeekCalendar } from '@/components/Calendar'
import { InterviewModal } from '@/components/InterviewModal'
import { MemberPhoto } from '@/components/MemberPhoto'
import { DevNotice, PreviewBanner } from '@/components/Notices'
import { Badge, CardHeader, Empty, PageHeader, Tabs } from '@/components/ui'
import type { Interview } from '@/data/types'
import { PSICO_ID } from '@/data/members'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { useStore } from '@/lib/store'

export default function Agenda() {
  const tr = useTr()
  const { lang } = useLang()
  const { interviews, byId } = useStore()
  const [view, setView] = useState<'semana' | 'mes'>('semana')
  const [anchor, setAnchor] = useState(new Date())
  const [sel, setSel] = useState<Interview | null>(null)
  const [joined, setJoined] = useState<string | null>(null)
  const mine = interviews.filter((i) => i.psicologaId === PSICO_ID)
  const today = mine.filter((i) => isSameDay(new Date(i.fecha), new Date()) && i.estado !== 'cancelada').sort((a, b) => a.fecha.localeCompare(b.fecha))
  const cancelled = mine.filter((i) => i.estado === 'cancelada')
  const move = (d: number) => setAnchor((a) => (view === 'semana' ? addWeeks(a, d) : addMonths(a, d)))

  return (
    <div>
      <PageHeader title={tr('Mi agenda', 'My schedule')} subtitle={tr('Lic. Carolina Méndez · tus entrevistas de la semana y los horarios libres.', 'Lic. Carolina Méndez · your interviews this week and free slots.')} />
      <PreviewBanner
        id="psico-agenda"
        bullets={[
          tr('Los candidatos eligen tus horarios libres y el turno se confirma solo.', 'Candidates pick your free slots and bookings confirm automatically.'),
          tr('Recordatorio 24h antes para vos y para el candidato.', '24h reminder for you and the candidate.'),
          tr('Videollamada integrada o dirección del consultorio.', 'Built-in video call or office address.'),
        ]}
      />
      {cancelled.length > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <CalendarX2 className="h-4 w-4 shrink-0" />
          <span className="flex-1">
            {tr('Cancelación', 'Cancellation')}: <b>{byId(cancelled[0].memberId)?.nombre} {byId(cancelled[0].memberId)?.apellido}</b> {tr('canceló su turno del', 'cancelled the appointment on')}{' '}
            {format(new Date(cancelled[0].fecha), "EEEE d · HH:mm", { locale: dateLocale(lang) })}. {tr('El horario quedó libre.', 'The slot is free again.')}
          </span>
          <button className="text-xs font-semibold underline" onClick={() => setSel(cancelled[0])}>{tr('Ver', 'View')}</button>
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card min-w-0">
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
            <Tabs value={view} onChange={setView} items={[{ value: 'semana', label: tr('Semana', 'Week') }, { value: 'mes', label: tr('Mes', 'Month') }]} />
            <button className="btn-ghost h-8 w-8 px-0" onClick={() => move(-1)} aria-label="prev"><ChevronLeft className="h-4 w-4" /></button>
            <button className="btn-outline btn-sm" onClick={() => setAnchor(new Date())}>{tr('Hoy', 'Today')}</button>
            <button className="btn-ghost h-8 w-8 px-0" onClick={() => move(1)} aria-label="next"><ChevronRight className="h-4 w-4" /></button>
            <div className="ml-auto flex flex-wrap gap-2 text-xs text-muted">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-600" />{tr('Agendada', 'Scheduled')}</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-600" />{tr('Realizada', 'Completed')}</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-600" />{tr('Cancelada', 'Cancelled')}</span>
              <span className="flex items-center gap-1"><span className="h-2 w-3 rounded border border-dashed border-zinc-400" />{tr('Libre', 'Free')}</span>
            </div>
          </div>
          <div className="p-3" data-trailer="psico-week">
            {view === 'semana' ? (
              <WeekCalendar
                anchor={anchor}
                interviews={mine}
                onSelect={setSel}
                colorMode="estado"
                freeSlots
                onFreeSlot={(d) => toast(tr(`Horario ${format(d, 'EEEE d · HH:mm', { locale: dateLocale(lang) })} ofrecido a candidatos`, `Slot ${format(d, 'EEEE d · HH:mm', { locale: dateLocale(lang) })} offered to candidates`))}
              />
            ) : (
              <MonthCalendar anchor={anchor} interviews={mine} onSelect={setSel} colorMode="estado" />
            )}
          </div>
        </div>
        <div className="card h-fit">
          <CardHeader title={tr('Hoy', 'Today')} subtitle={format(new Date(), lang === 'es' ? "EEEE d 'de' MMMM" : 'EEEE, MMMM d', { locale: dateLocale(lang) })} />
          {today.length === 0 ? (
            <Empty text={tr('Sin entrevistas hoy.', 'No interviews today.')} />
          ) : (
            <ul className="divide-y divide-border">
              {today.map((iv) => {
                const m = byId(iv.memberId)!
                return (
                  <li key={iv.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="num w-12 text-sm font-bold text-accent">{format(new Date(iv.fecha), 'HH:mm')}</span>
                      <MemberPhoto member={m} size="sm" />
                      <button className="min-w-0 flex-1 text-left" onClick={() => setSel(iv)}>
                        <p className="truncate text-sm font-semibold">{m.nombre} {m.apellido}</p>
                        <p className="text-xs text-muted">{iv.estado === 'realizada' ? tr('Realizada', 'Completed') : tr('Primera entrevista', 'First interview')}</p>
                      </button>
                    </div>
                    {iv.modalidad === 'zoom' ? (
                      <button className="btn-primary btn-sm mt-2 w-full" onClick={() => { setJoined(iv.id); toast(tr(`Uniéndote a la videollamada con ${m.nombre}…`, `Joining the video call with ${m.nombre}…`)) }}>
                        <Video className="h-3.5 w-3.5" /> {tr('Unirse', 'Join')}
                      </button>
                    ) : (
                      <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs"><MapPin className="h-3.5 w-3.5 text-accent" />Av. Santa Fe 2450, 3° B, Palermo</p>
                    )}
                    {joined === iv.id && (
                      <DevNotice
                        compact
                        className="mt-2"
                        title={tr('Videollamada', 'Video call')}
                        now={tr('Ahora el acceso está simulado.', 'Access is simulated for now.')}
                        later={tr('Al desarrollar, se abre la sala segura del turno.', 'Once built, the appointment’s secure room opens.')}
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          )}
          <div className="border-t border-border p-4 text-xs text-muted">
            <Badge tone="blue">{tr(`${mine.filter((i) => i.estado === 'agendada').length} próximas`, `${mine.filter((i) => i.estado === 'agendada').length} upcoming`)}</Badge>{' '}
            {tr('Recordatorio 24h activo', '24h reminder on')}
          </div>
        </div>
      </div>
      <InterviewModal iv={sel} onClose={() => setSel(null)} />
    </div>
  )
}
