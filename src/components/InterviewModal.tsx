import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CalendarClock, MapPin, Video } from 'lucide-react'
import type { Interview } from '@/data/types'
import { INTERVIEW_ESTADOS, MODALIDAD, RESULTADOS, tx } from '@/data/catalog'
import { psicoById } from '@/data/members'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { useSession } from '@/lib/session'
import { useStore } from '@/lib/store'
import { MemberPhoto } from './MemberPhoto'
import { DevNotice } from './Notices'
import { Badge, Modal, StatusBadge } from './ui'

export function InterviewModal({ iv, onClose }: { iv: Interview | null; onClose: () => void }) {
  const tr = useTr()
  const { lang } = useLang()
  const { role } = useSession()
  const navigate = useNavigate()
  const { byId, setInterviews } = useStore()
  if (!iv) return null
  const m = byId(iv.memberId)
  if (!m) return null
  const cancel = () => {
    setInterviews((l) => l.map((x) => (x.id === iv.id ? { ...x, estado: 'cancelada' } : x)))
    toast(tr('Turno cancelado. Se avisó al candidato.', 'Appointment cancelled. The candidate was notified.'))
    onClose()
  }
  return (
    <Modal open={!!iv} onOpenChange={(v) => !v && onClose()} title={tr('Detalle del turno', 'Appointment details')}>
      <div className="flex items-center gap-3">
        <MemberPhoto member={m} size="lg" />
        <div>
          <p className="text-lg font-semibold">{m.nombre} {m.apellido}</p>
          <p className="text-sm text-muted">{m.edad} · {m.ciudad}</p>
          <div className="mt-1 flex gap-1"><StatusBadge status={m.estado} /></div>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div><dt className="label-xs">{tr('Fecha', 'Date')}</dt><dd className="mt-0.5 flex items-center gap-1.5 font-medium"><CalendarClock className="h-3.5 w-3.5 text-accent" />{format(new Date(iv.fecha), "EEE d MMM · HH:mm", { locale: dateLocale(lang) })}</dd></div>
        <div><dt className="label-xs">{tr('Modalidad', 'Format')}</dt><dd className="mt-0.5 flex items-center gap-1.5 font-medium">{iv.modalidad === 'zoom' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}{tx(MODALIDAD, iv.modalidad, lang)}</dd></div>
        <div><dt className="label-xs">{tr('Psicóloga', 'Psychologist')}</dt><dd className="mt-0.5 font-medium">{psicoById(iv.psicologaId).nombre}</dd></div>
        <div><dt className="label-xs">{tr('Estado', 'Status')}</dt><dd className="mt-0.5 flex gap-1"><Badge tone={iv.estado === 'cancelada' ? 'red' : iv.estado === 'realizada' ? 'green' : 'blue'}>{tx(INTERVIEW_ESTADOS, iv.estado, lang)}</Badge>{iv.resultado && <Badge tone="accent">{tx(RESULTADOS, iv.resultado, lang)}</Badge>}</dd></div>
      </dl>
      {iv.modalidad === 'presencial' && iv.estado === 'agendada' && (
        <p className="mt-3 rounded-lg bg-surface-2 p-2.5 text-sm"><MapPin className="mr-1 inline h-3.5 w-3.5 text-accent" />{tr('Consultorio de la agencia · Av. Santa Fe 2450, 3° B, Palermo', 'Agency office · Av. Santa Fe 2450, 3rd B, Palermo')}</p>
      )}
      {iv.notas && <p className="mt-3 rounded-lg border border-border p-3 text-sm">{iv.notas[lang]}</p>}
      {iv.estado === 'agendada' && iv.modalidad === 'zoom' && (
        <DevNotice
          compact
          className="mt-3"
          title={tr('Videollamada', 'Video call')}
          now={tr('Ahora el botón “Unirse” es simulado.', 'The “Join” button is simulated for now.')}
          later={tr('Al desarrollar, se genera un link de videollamada seguro para cada turno.', 'Once built, a secure video link is generated for each appointment.')}
        />
      )}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {iv.estado === 'agendada' && (
          <button className="btn-outline text-red-600" onClick={cancel}>{tr('Cancelar turno', 'Cancel appointment')}</button>
        )}
        {role === 'admin' ? (
          <button className="btn-primary" onClick={() => { onClose(); navigate(`/admin/usuarios/${m.id}`) }}>{tr('Ver ficha', 'View profile')}</button>
        ) : (
          <button className="btn-primary" onClick={() => { onClose(); navigate(`/psico/entrevistas/${iv.id}`) }}>{tr('Abrir entrevista', 'Open interview')}</button>
        )}
      </div>
    </Modal>
  )
}
