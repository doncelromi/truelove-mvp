import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { BellRing, CalendarClock, CalendarX2, Video } from 'lucide-react'
import { DevNotice, PreviewBanner } from '@/components/Notices'
import { Badge, Empty, Modal, PageHeader } from '@/components/ui'
import { MODALIDAD, tx } from '@/data/catalog'
import { psicoById } from '@/data/members'
import { freeSlots } from '@/data/ops'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function MiEntrevista() {
  const tr = useTr()
  const { lang } = useLang()
  const { currentUserId, byId, interviews, setInterviews } = useStore()
  const me = byId(currentUserId)!
  const iv = interviews.find((i) => i.memberId === me.id && i.estado === 'agendada')
  const done = interviews.find((i) => i.memberId === me.id && i.estado === 'realizada')
  const [resched, setResched] = useState(false)
  const [slot, setSlot] = useState('')
  const [joined, setJoined] = useState(false)
  const fmt = (d: string) => format(new Date(d), lang === 'es' ? "EEEE d 'de' MMMM · HH:mm" : 'EEEE, MMMM d · HH:mm', { locale: dateLocale(lang) })

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={tr('Tu entrevista', 'Your interview')} subtitle={tr('Una charla tranquila con tu psicóloga para conocerte y acompañarte en el proceso.', 'A relaxed conversation with your psychologist to get to know you and support you.')} />
      <PreviewBanner
        id="user-entrevista"
        bullets={[
          tr('Turno confirmado automáticamente, con recordatorio 24 h antes.', 'Automatically confirmed appointment, with a 24h reminder.'),
          tr('Videollamada segura o consultorio presencial.', 'Secure video call or in-person office.'),
          tr('Reprogramás o cancelás vos mismo, sin llamar a nadie.', 'Reschedule or cancel yourself, no calls needed.'),
        ]}
      />
      {!iv ? (
        <div className="card p-6">
          <Empty
            icon={<CalendarClock className="h-7 w-7" />}
            text={done ? tr('Tu entrevista ya fue realizada. ¡Gracias!', 'Your interview is done. Thank you!') : tr('Todavía no tenés turno.', 'You don’t have an appointment yet.')}
          />
          {!done && <div className="text-center"><Link to="/mi/onboarding" className="btn-primary">{tr('Pedir turno', 'Book appointment')}</Link></div>}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="bg-accent-soft p-6">
            <Badge tone="green">{tr('Turno confirmado', 'Appointment confirmed')}</Badge>
            <p className="mt-3 text-2xl font-bold capitalize">{fmt(iv.fecha)}</p>
            <p className="mt-1 text-sm text-muted">{psicoById(iv.psicologaId).nombre} · {tx(MODALIDAD, iv.modalidad, lang)} · 50 min</p>
          </div>
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3 text-sm">
              <BellRing className="h-4 w-4 text-accent" />
              {tr('Recordatorio programado por email y SMS 24 h antes.', 'Reminder scheduled by email and SMS 24h before.')}
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" onClick={() => { setJoined(true); toast(tr('La sala se habilita 10 minutos antes del turno.', 'The room opens 10 minutes before the appointment.')) }}>
                <Video className="h-4 w-4" /> {tr('Unirse a la videollamada', 'Join video call')}
              </button>
              <button className="btn-outline" onClick={() => setResched(true)}><CalendarClock className="h-4 w-4" /> {tr('Reprogramar', 'Reschedule')}</button>
              <button
                className="btn-outline text-red-600"
                onClick={() => {
                  setInterviews((l) => l.map((i) => (i.id === iv.id ? { ...i, estado: 'cancelada' } : i)))
                  toast(tr('Turno cancelado. Podés pedir uno nuevo cuando quieras.', 'Appointment cancelled. You can book a new one anytime.'))
                }}
              >
                <CalendarX2 className="h-4 w-4" /> {tr('Cancelar', 'Cancel')}
              </button>
            </div>
            {joined && (
              <DevNotice
                compact
                title={tr('Videollamada', 'Video call')}
                now={tr('Ahora el acceso está simulado.', 'Access is simulated for now.')}
                later={tr('Al desarrollar, se abre una sala segura para tu turno.', 'Once built, a secure room opens for your appointment.')}
              />
            )}
            <div className="rounded-xl bg-surface-2 p-4 text-sm">
              <p className="font-semibold">{tr('¿Cómo prepararte?', 'How to prepare?')}</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-muted">
                <li>{tr('Buscá un lugar tranquilo y con buena conexión.', 'Find a quiet place with a good connection.')}</li>
                <li>{tr('No hace falta preparar nada: es una charla.', 'No need to prepare anything: it’s a conversation.')}</li>
                <li>{tr('Te respondemos dentro de las 48 h.', 'We’ll answer within 48h.')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <Modal open={resched} onOpenChange={setResched} title={tr('Reprogramar entrevista', 'Reschedule interview')}>
        <div className="grid grid-cols-2 gap-2">
          {freeSlots().map((s) => (
            <button key={s} onClick={() => setSlot(s)} className={cn('rounded-lg border px-3 py-2 text-left text-sm capitalize', slot === s ? 'border-accent bg-accent-soft text-accent' : 'border-border hover:border-accent/50')}>
              {format(new Date(s), 'EEE d MMM · HH:mm', { locale: dateLocale(lang) })}
            </button>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-outline" onClick={() => setResched(false)}>{tr('Cancelar', 'Cancel')}</button>
          <button
            className="btn-primary"
            disabled={!slot}
            onClick={() => {
              if (iv) setInterviews((l) => l.map((i) => (i.id === iv.id ? { ...i, fecha: slot } : i)))
              setResched(false)
              toast.success(tr('Turno reprogramado y confirmado', 'Appointment rescheduled and confirmed'))
            }}
          >
            {tr('Confirmar', 'Confirm')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
