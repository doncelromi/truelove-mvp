import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, Clock, Info, Loader2, MapPin, Tag, Video } from 'lucide-react'
import { MemberPhoto } from '@/components/MemberPhoto'
import { Facts, Gallery, QuestionnaireAnswers, RejectModal, Section, Songs } from '@/components/MemberSections'
import { PreviewBanner } from '@/components/Notices'
import { Empty, PageHeader, StatusBadge } from '@/components/ui'
import { MODALIDAD, PROFESIONES, TAGS_PSICO, tx } from '@/data/catalog'
import type { Resultado } from '@/data/types'
import { useMemberActions } from '@/lib/actions'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { rankFor } from '@/lib/score'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function EntrevistaDetalle() {
  const { id = '' } = useParams()
  const tr = useTr()
  const { lang } = useLang()
  const { interviews, setInterviews, byId, updateMember, members, weights, advanced, filters, scoreCtx, addAudit } = useStore()
  const { approve } = useMemberActions()
  const iv = interviews.find((i) => i.id === id)
  const m = iv ? byId(iv.memberId) : undefined
  const [notes, setNotes] = useState(iv?.notas?.[lang] ?? '')
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [rejectOpen, setRejectOpen] = useState(false)
  const timer = useRef<number>()

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const best = useMemo(() => {
    if (!m) return undefined
    return rankFor(m, members, weights, advanced, filters, scoreCtx).find((r) => !r.result.excluded)
  }, [m, members, weights, advanced, filters, scoreCtx])

  if (!iv || !m) return <Empty text={tr('Entrevista no encontrada.', 'Interview not found.')} />

  const onNotes = (v: string) => {
    setNotes(v)
    setSaving('saving')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setInterviews((l) => l.map((x) => (x.id === iv.id ? { ...x, notas: { es: v, en: v } } : x)))
      setSaving('saved')
    }, 700)
  }

  const toggleTag = (t: string) => {
    const on = m.etiquetasPsico.includes(t)
    updateMember(m.id, { etiquetasPsico: on ? m.etiquetasPsico.filter((x) => x !== t) : [...m.etiquetasPsico, t] })
    toast(on ? tr('Etiqueta quitada · score recalculado', 'Tag removed · score recalculated') : tr('Etiqueta agregada · score recalculado', 'Tag added · score recalculated'))
  }

  const setResult = (r: Resultado) => {
    setInterviews((l) => l.map((x) => (x.id === iv.id ? { ...x, estado: 'realizada', resultado: r } : x)))
    if (r === 'aprobado') approve(m)
    else if (r === 'rechazado') setRejectOpen(true)
    else {
      updateMember(m.id, { estado: 'pendiente' })
      addAudit('Lic. Carolina Méndez', 'perfil', { es: `Marcó “En espera” a ${m.nombre} ${m.apellido}`, en: `Set ${m.nombre} ${m.apellido} “On hold”` })
      toast(tr(`${m.nombre} quedó en espera`, `${m.nombre} is on hold`))
    }
  }

  const RESULTS: { v: Resultado; label: string; cls: string }[] = [
    { v: 'aprobado', label: tr('Aprobado', 'Approved'), cls: 'border-green-600 bg-green-600 text-white' },
    { v: 'en espera', label: tr('En espera', 'On hold'), cls: 'border-amber-500 bg-amber-500 text-white' },
    { v: 'rechazado', label: tr('Rechazado', 'Rejected'), cls: 'border-red-600 bg-red-600 text-white' },
  ]

  return (
    <div>
      <Link to="/psico/entrevistas" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> {tr('Volver a entrevistas', 'Back to interviews')}
      </Link>
      <PageHeader title={tr('Entrevista', 'Interview')} subtitle={`${m.nombre} ${m.apellido} · ${format(new Date(iv.fecha), "EEEE d MMM · HH:mm", { locale: dateLocale(lang) })}`} />
      <PreviewBanner
        id="psico-entrevista-detalle"
        bullets={[
          tr('Todo lo que el candidato cargó, en una sola pantalla.', 'Everything the candidate uploaded, on one screen.'),
          tr('Notas con autoguardado y etiquetas para el motor.', 'Auto-saved notes and tags for the engine.'),
          tr('Resultado con un clic y aviso automático al candidato.', 'One-click outcome with automatic notice to the candidate.'),
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <MemberPhoto member={m} size="xl" />
            <div className="flex-1">
              <h2 className="text-xl font-bold">{m.nombre} {m.apellido}, <span className="num">{m.edad}</span></h2>
              <p className="text-sm text-muted">{PROFESIONES[m.profesion]?.[lang]} · {m.ciudad}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <StatusBadge status={m.estado} />
                <span className="chip border border-border">
                  {iv.modalidad === 'zoom' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />} {tx(MODALIDAD, iv.modalidad, lang)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{m.bio[lang]}</p>
            </div>
          </div>
          <Section title={tr('Datos clave', 'Key facts')}><Facts member={m} /></Section>
          <div className="grid gap-4 xl:grid-cols-2">
            <Section title={tr('Galería', 'Gallery')}><Gallery member={m} /></Section>
            <Section title={tr('Canciones', 'Songs')}><Songs member={m} /></Section>
          </div>
          <Section title={tr('Respuestas del cuestionario', 'Questionnaire answers')}><QuestionnaireAnswers member={m} /></Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit" data-trailer="interview-panel">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <p className="label-xs">{tr('Notas de la entrevista', 'Interview notes')}</p>
              <span className="flex items-center gap-1 text-xs text-muted">
                {saving === 'saving' && <><Loader2 className="h-3 w-3 animate-spin" /> {tr('Guardando…', 'Saving…')}</>}
                {saving !== 'saving' && <><CheckCircle2 className="h-3 w-3 text-green-600" /> {tr('Guardado', 'Saved')}</>}
              </span>
            </div>
            <textarea
              className="input mt-2 h-40 resize-y py-2 leading-relaxed"
              placeholder={tr('Escribí tus observaciones…', 'Write your observations…')}
              value={notes}
              onChange={(e) => onNotes(e.target.value)}
            />
          </div>

          <div className="card p-5">
            <p className="label-xs flex items-center gap-1.5"><Tag className="h-3 w-3" /> {tr('Etiquetas para el motor', 'Tags for the engine')}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Object.entries(TAGS_PSICO).map(([k, v]) => {
                const on = m.etiquetasPsico.includes(k)
                return (
                  <button key={k} onClick={() => toggleTag(k)} className={cn('chip border transition-colors', on ? 'border-accent bg-accent text-white' : 'border-border hover:border-accent/60')}>
                    {v[lang]}
                  </button>
                )
              })}
            </div>
            <div className="mt-3 flex gap-2 rounded-lg bg-accent-soft p-3 text-xs text-accent">
              <Info className="h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">{tr('Estas notas ajustan el score de compatibilidad', 'These notes adjust the compatibility score')}</p>
                {best && (
                  <p className="mt-0.5 text-fg/80">
                    {tr('Mejor pareja sugerida hoy:', 'Best suggested match today:')} <b>{best.member.nombre} {best.member.apellido}</b> · <span className="num">{best.result.score}</span>{' '}
                    ({tr('ajuste psicológico', 'psych adjustment')} <span className="num">{best.result.psicoAdj >= 0 ? '+' : ''}{best.result.psicoAdj}</span>)
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <p className="label-xs">{tr('Resultado', 'Outcome')}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {RESULTS.map((r) => (
                <button
                  key={r.v}
                  onClick={() => setResult(r.v)}
                  className={cn('h-10 rounded-lg border text-sm font-semibold transition-colors', iv.resultado === r.v ? r.cls : 'border-border hover:bg-surface-2')}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted"><Clock className="h-3 w-3" /> {tr('El candidato recibe la respuesta dentro de las 48 h.', 'The candidate gets the answer within 48h.')}</p>
          </div>
        </aside>
      </div>
      <RejectModal member={m} open={rejectOpen} onOpenChange={setRejectOpen} />
    </div>
  )
}
