import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ChevronRight, MapPin, Video } from 'lucide-react'
import { MemberPhoto } from '@/components/MemberPhoto'
import { PreviewBanner } from '@/components/Notices'
import { Badge, Empty, PageHeader, Tabs } from '@/components/ui'
import { MODALIDAD, RESULTADOS, tx } from '@/data/catalog'
import { PSICO_ID } from '@/data/members'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { useStore } from '@/lib/store'

export default function Entrevistas() {
  const tr = useTr()
  const { lang } = useLang()
  const navigate = useNavigate()
  const { interviews, byId } = useStore()
  const [tab, setTab] = useState<'proximas' | 'realizadas' | 'canceladas'>('proximas')
  const mine = interviews.filter((i) => i.psicologaId === PSICO_ID)
  const groups = {
    proximas: mine.filter((i) => i.estado === 'agendada').sort((a, b) => a.fecha.localeCompare(b.fecha)),
    realizadas: mine.filter((i) => i.estado === 'realizada').sort((a, b) => b.fecha.localeCompare(a.fecha)),
    canceladas: mine.filter((i) => i.estado === 'cancelada'),
  }
  const list = groups[tab]
  return (
    <div>
      <PageHeader title={tr('Entrevistas', 'Interviews')} subtitle={tr('Tus entrevistas próximas y realizadas, con notas y resultado.', 'Your upcoming and completed interviews, with notes and outcome.')} />
      <PreviewBanner
        id="psico-entrevistas"
        bullets={[
          tr('Ficha del candidato, notas con autoguardado y etiquetas profesionales.', 'Candidate file, auto-saved notes and professional tags.'),
          tr('Tus etiquetas ajustan el score de compatibilidad del motor.', 'Your tags adjust the engine’s compatibility score.'),
          tr('El resultado (aprobado, en espera, rechazado) se comunica solo.', 'The outcome (approved, on hold, rejected) is communicated automatically.'),
        ]}
      />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'proximas', label: tr('Próximas', 'Upcoming'), count: groups.proximas.length },
          { value: 'realizadas', label: tr('Realizadas', 'Completed'), count: groups.realizadas.length },
          { value: 'canceladas', label: tr('Canceladas', 'Cancelled'), count: groups.canceladas.length },
        ]}
      />
      <div className="card mt-4">
        {list.length === 0 ? (
          <Empty text={tr('No hay entrevistas acá.', 'No interviews here.')} />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((iv) => {
              const m = byId(iv.memberId)!
              return (
                <li key={iv.id}>
                  <button className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2" onClick={() => navigate(`/psico/entrevistas/${iv.id}`)}>
                    <MemberPhoto member={m} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{m.nombre} {m.apellido}, <span className="num">{m.edad}</span></p>
                      <p className="flex items-center gap-1.5 text-xs text-muted">
                        {iv.modalidad === 'zoom' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                        {tx(MODALIDAD, iv.modalidad, lang)} · <span className="capitalize">{format(new Date(iv.fecha), "EEE d MMM · HH:mm", { locale: dateLocale(lang) })}</span>
                      </p>
                    </div>
                    {iv.resultado && <Badge tone={iv.resultado === 'aprobado' ? 'green' : iv.resultado === 'rechazado' ? 'red' : 'amber'}>{tx(RESULTADOS, iv.resultado, lang)}</Badge>}
                    <ChevronRight className="h-4 w-4 text-muted" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
