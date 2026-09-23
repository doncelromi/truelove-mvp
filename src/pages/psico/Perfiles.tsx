import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { CalendarPlus, Check, Eye, Minus } from 'lucide-react'
import { MemberPhoto } from '@/components/MemberPhoto'
import { Facts, Gallery, QuestionnaireAnswers, Songs } from '@/components/MemberSections'
import { PreviewBanner } from '@/components/Notices'
import { Drawer, Empty, Modal, PageHeader, PagoBadge, StatusBadge } from '@/components/ui'
import { PROFESIONES } from '@/data/catalog'
import { PSICO_ID } from '@/data/members'
import { freeSlots } from '@/data/ops'
import type { Member } from '@/data/types'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

function Indicator({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn('chip ring-1 ring-inset', ok ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400' : 'bg-zinc-100 text-zinc-500 ring-zinc-500/20 dark:bg-zinc-500/10')}>
      {ok ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />} {label}
    </span>
  )
}

export default function Perfiles() {
  const tr = useTr()
  const { lang } = useLang()
  const navigate = useNavigate()
  const { members, interviews, setInterviews } = useStore()
  const [view, setView] = useState<Member | null>(null)
  const [booking, setBooking] = useState<Member | null>(null)
  const [slot, setSlot] = useState('')

  const queue = members
    .filter((m) => m.psicologaId === PSICO_ID && (m.estado === 'pendiente' || m.estado === 'incompleto'))
    .sort((a, b) => b.completitud - a.completitud)
  const nextIv = (m: Member) => interviews.find((i) => i.memberId === m.id && i.estado === 'agendada')

  const book = () => {
    if (!booking || !slot) return
    setInterviews((l) => [
      ...l,
      { id: `iv${l.length + 1}`, memberId: booking.id, psicologaId: PSICO_ID, fecha: slot, modalidad: 'zoom', estado: 'agendada' },
    ])
    toast.success(tr(`Entrevista agendada con ${booking.nombre}. Se le envió la confirmación.`, `Interview booked with ${booking.nombre}. Confirmation sent.`))
    setBooking(null)
    setSlot('')
  }

  return (
    <div>
      <PageHeader title={tr('Perfiles a revisar', 'Profiles to review')} subtitle={tr('Tu cola de candidatos asignados, ordenada por completitud.', 'Your queue of assigned candidates, sorted by completeness.')} />
      <PreviewBanner
        id="psico-perfiles"
        bullets={[
          tr('Te llega un aviso cuando un perfil queda listo para revisar.', 'You get notified when a profile is ready for review.'),
          tr('Ves de un vistazo si tiene fotos, canciones y cuestionario.', 'See at a glance whether it has photos, songs and questionnaire.'),
          tr('Agendás la entrevista en un clic desde tu agenda.', 'Book the interview in one click from your schedule.'),
        ]}
      />
      {queue.length === 0 ? (
        <Empty text={tr('No tenés perfiles pendientes.', 'You have no pending profiles.')} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {queue.map((m) => {
            const iv = nextIv(m)
            return (
              <div key={m.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <MemberPhoto member={m} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{m.nombre} {m.apellido}, <span className="num">{m.edad}</span></p>
                    <p className="truncate text-xs text-muted">{PROFESIONES[m.profesion]?.[lang]} · {m.ciudad}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1"><StatusBadge status={m.estado} /><PagoBadge pago={m.pago} /></div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs"><span className="text-muted">{tr('Completitud del perfil', 'Profile completeness')}</span><span className="num">{m.completitud}%</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-surface-2"><div className="h-1.5 rounded-full bg-accent" style={{ width: `${m.completitud}%` }} /></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Indicator ok={m.fotos.length > 0} label={tr('fotos', 'photos')} />
                  <Indicator ok={m.canciones.length > 0} label={tr('canciones', 'songs')} />
                  <Indicator ok={m.cuestionario.length >= 10} label={tr('cuestionario', 'questionnaire')} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn-outline btn-sm" onClick={() => setView(m)}><Eye className="h-3.5 w-3.5" /> {tr('Ver perfil', 'View profile')}</button>
                  {iv ? (
                    <button className="btn-accent-outline btn-sm" onClick={() => navigate(`/psico/entrevistas/${iv.id}`)}>
                      {tr('Turno', 'Booked')}: {format(new Date(iv.fecha), 'EEE d · HH:mm', { locale: dateLocale(lang) })}
                    </button>
                  ) : (
                    <button className="btn-primary btn-sm" onClick={() => setBooking(m)} disabled={m.pago !== 'ok'} title={m.pago !== 'ok' ? tr('Falta el pago de la membresía', 'Membership payment missing') : undefined}>
                      <CalendarPlus className="h-3.5 w-3.5" /> {tr('Agendar entrevista', 'Book interview')}
                    </button>
                  )}
                </div>
                {m.pago !== 'ok' && <p className="mt-2 text-xs text-amber-600">{tr('Acceso bloqueado hasta que pague la membresía.', 'Access blocked until the membership is paid.')}</p>}
              </div>
            )
          })}
        </div>
      )}

      <Drawer open={!!view} onOpenChange={(v) => !v && setView(null)} title={view ? `${view.nombre} ${view.apellido}` : ''}>
        {view && (
          <div className="space-y-6">
            <div><p className="label-xs mb-2">{tr('Fotos', 'Photos')}</p><Gallery member={view} /></div>
            <div><p className="label-xs mb-2">{tr('Canciones', 'Songs')}</p><Songs member={view} /></div>
            <div><p className="label-xs mb-2">{tr('Valores y proyecto', 'Values and plans')}</p><Facts member={view} /></div>
            <div><p className="label-xs mb-2">{tr('Cuestionario', 'Questionnaire')}</p><QuestionnaireAnswers member={view} /></div>
          </div>
        )}
      </Drawer>

      <Modal open={!!booking} onOpenChange={(v) => !v && setBooking(null)} title={tr(`Agendar entrevista con ${booking?.nombre ?? ''}`, `Book interview with ${booking?.nombre ?? ''}`)} description={tr('Horarios libres de tu agenda', 'Free slots from your schedule')}>
        <div className="grid grid-cols-2 gap-2">
          {freeSlots().map((s) => (
            <button key={s} onClick={() => setSlot(s)} className={cn('rounded-lg border px-3 py-2 text-left text-sm capitalize', slot === s ? 'border-accent bg-accent-soft text-accent' : 'border-border hover:border-accent/50')}>
              {format(new Date(s), "EEE d MMM · HH:mm", { locale: dateLocale(lang) })}
            </button>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-outline" onClick={() => setBooking(null)}>{tr('Cancelar', 'Cancel')}</button>
          <button className="btn-primary" disabled={!slot} onClick={book}>{tr('Confirmar turno', 'Confirm appointment')}</button>
        </div>
      </Modal>
    </div>
  )
}
