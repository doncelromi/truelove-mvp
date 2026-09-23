import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Check, HeartHandshake, TriangleAlert } from 'lucide-react'
import { RingsIcon } from '@/components/Logo'
import { MemberPhoto } from '@/components/MemberPhoto'
import { PreviewBanner } from '@/components/Notices'
import { Badge, CardHeader, PageHeader, ScoreRing } from '@/components/ui'
import { SUG_ESTADOS, tx } from '@/data/catalog'
import { PSICO_ID, psicoById } from '@/data/members'
import type { SugerenciaEstado } from '@/data/types'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { computeScore } from '@/lib/score'
import { useStore } from '@/lib/store'

const TONE: Record<SugerenciaEstado, 'green' | 'blue' | 'amber' | 'gray'> = { aceptada: 'green', propuesta: 'blue', 'en revisión': 'amber', descartada: 'gray' }

export default function Sugerencias() {
  const tr = useTr()
  const { lang } = useLang()
  const { members, byId, weights, advanced, filters, scoreCtx, suggestions, setSuggestions, addAudit } = useStore()
  const approved = members.filter((m) => m.estado === 'aprobado')
  const [aId, setAId] = useState('h19')
  const [bId, setBId] = useState('f02')
  const [comment, setComment] = useState('')
  const a = byId(aId)!
  const b = byId(bId)!
  const result = useMemo(() => computeScore(a, b, weights, advanced, filters, scoreCtx), [a, b, weights, advanced, filters, scoreCtx])
  const others = approved.filter((m) => m.genero !== a.genero)

  const propose = () => {
    setSuggestions((s) => [
      { id: `sg${Date.now()}`, aId, bId, psicologaId: PSICO_ID, comentario: { es: comment, en: comment }, estado: 'propuesta', fecha: new Date().toISOString() },
      ...s,
    ])
    addAudit('Lic. Carolina Méndez', 'motor', { es: `Sugirió presentar a ${a.nombre} ${a.apellido} y ${b.nombre} ${b.apellido}`, en: `Suggested introducing ${a.nombre} ${a.apellido} and ${b.nombre} ${b.apellido}` })
    toast.success(tr('Sugerencia enviada a la administradora', 'Suggestion sent to the administrator'))
    setComment('')
  }

  return (
    <div>
      <PageHeader title={tr('Sugerir matches', 'Suggest matches')} subtitle={tr('Tu mirada profesional suma: proponé presentaciones que el motor podría no ver.', 'Your professional view adds up: propose introductions the engine might miss.')} />
      <PreviewBanner
        id="psico-sugerencias"
        bullets={[
          tr('Elegís dos miembros aprobados y ves su score al instante.', 'Pick two approved members and see their score instantly.'),
          tr('Sumás un comentario profesional que ve la administradora.', 'Add a professional comment the administrator sees.'),
          tr('Seguís el estado de cada sugerencia.', 'Track the status of each suggestion.'),
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="card p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
            <label>
              <span className="label-xs">{tr('Miembro A', 'Member A')}</span>
              <select className="input mt-1" value={aId} onChange={(e) => { setAId(e.target.value); const na = byId(e.target.value)!; if (byId(bId)!.genero === na.genero) setBId(approved.find((m) => m.genero !== na.genero)!.id) }}>
                {approved.map((m) => <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>)}
              </select>
            </label>
            <RingsIcon className="mx-auto mb-2 h-5 w-6" />
            <label>
              <span className="label-xs">{tr('Miembro B', 'Member B')}</span>
              <select className="input mt-1" value={bId} onChange={(e) => setBId(e.target.value)}>
                {others.map((m) => <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-5 flex items-center gap-4 rounded-xl bg-surface-2 p-4">
            <MemberPhoto member={a} size="lg" />
            <RingsIcon className="h-6 w-7" />
            <MemberPhoto member={b} size="lg" />
            <div className="flex-1" />
            <ScoreRing score={result.score} size={76} muted={!!result.excluded} />
          </div>
          {result.excluded && <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600"><TriangleAlert className="h-4 w-4" />{result.excluded.reason[lang]}</p>}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ul className="space-y-1 text-sm">
              {result.coinciden.slice(0, 5).map((c) => <li key={c.es} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />{c[lang]}</li>)}
            </ul>
            <ul className="space-y-1 text-sm">
              {result.divergen.slice(0, 4).map((c) => <li key={c.es} className="flex gap-2"><TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />{c[lang]}</li>)}
            </ul>
          </div>
          <label className="mt-5 block">
            <span className="label-xs">{tr('Comentario profesional', 'Professional comment')}</span>
            <textarea className="input mt-1 h-24 py-2" placeholder={tr('¿Por qué creés que pueden funcionar?', 'Why do you think they could work?')} value={comment} onChange={(e) => setComment(e.target.value)} />
          </label>
          <button className="btn-primary mt-3 w-full sm:w-auto" disabled={!comment.trim()} onClick={propose}>
            <HeartHandshake className="h-4 w-4" /> {tr('Proponer match', 'Propose match')}
          </button>
        </div>

        <div className="card h-fit">
          <CardHeader title={tr('Sugerencias enviadas', 'Suggestions sent')} subtitle={tr('De todo el equipo de psicólogas', 'From the whole psychologist team')} />
          <ul className="divide-y divide-border">
            {suggestions.map((s) => {
              const x = byId(s.aId)!
              const y = byId(s.bId)!
              return (
                <li key={s.id} className="p-4">
                  <div className="flex items-center gap-2">
                    <MemberPhoto member={x} size="xs" />
                    <RingsIcon className="h-3.5 w-4" />
                    <MemberPhoto member={y} size="xs" />
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">{x.nombre} & {y.nombre}</p>
                    <Badge tone={TONE[s.estado]}>{tx(SUG_ESTADOS, s.estado, lang)}</Badge>
                  </div>
                  <p className="mt-1.5 text-sm text-muted">“{s.comentario[lang]}”</p>
                  <p className="mt-1 text-xs text-muted">{psicoById(s.psicologaId).nombre} · {format(new Date(s.fecha), 'd MMM', { locale: dateLocale(lang) })}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
