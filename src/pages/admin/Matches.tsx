import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Ban, Brain, Check, CheckCircle2, Filter, HeartHandshake, Loader2, RotateCcw, Sparkles, TriangleAlert } from 'lucide-react'
import { RingsIcon } from '@/components/Logo'
import { MemberPhoto } from '@/components/MemberPhoto'
import { DevNotice, PreviewBanner } from '@/components/Notices'
import { Drawer, PageHeader, ScoreRing, Slider, Switch, Badge } from '@/components/ui'
import { CRITERIOS, PROFESIONES } from '@/data/catalog'
import { DEFAULT_ADMIN_MEMBER, psicoById } from '@/data/members'
import type { CriterionKey, Member } from '@/data/types'
import { useLang, useTr, type Bi } from '@/lib/i18n'
import { DEFAULT_ADVANCED, DEFAULT_FILTERS, DEFAULT_WEIGHTS, rankFor, type FactorKey, type ScoreResult } from '@/lib/score'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const FACTOR_LABEL: Record<FactorKey, Bi> = {
  ...CRITERIOS,
  emocional: { es: 'Compatibilidad emocional', en: 'Emotional compatibility' },
}

type Row = { member: Member; result: ScoreResult }

export default function Matches() {
  const tr = useTr()
  const { lang } = useLang()
  const [params, setParams] = useSearchParams()
  const { members, byId, weights, setWeights, advanced, setAdvanced, filters, setFilters, scoreCtx, addPresented, addAudit, suggestions } = useStore()
  const [selectedId, setSelectedId] = useState(DEFAULT_ADMIN_MEMBER)
  const [openPair, setOpenPair] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [proposed, setProposed] = useState<string[]>([])
  const saveTimer = useRef<number>()

  const selected = byId(selectedId)!
  const approved = useMemo(() => members.filter((m) => m.estado === 'aprobado'), [members])

  const ranked: Row[] = useMemo(
    () => rankFor(selected, members, weights, advanced, filters, scoreCtx),
    [selected, members, weights, advanced, filters, scoreCtx],
  )
  // los excluidos por estado (rechazado/pausa) no se listan; el resto se muestra marcado
  const visible = ranked.filter((r) => !r.result.excluded || !['rechazado', 'pausa'].includes(r.result.excluded.kind))
  const top = visible.find((r) => !r.result.excluded)

  const touch = useCallback(() => {
    setSaving(true)
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => setSaving(false), 650)
  }, [])

  const setWeight = useCallback(
    (k: CriterionKey, v: number) => {
      setWeights((w) => ({ ...w, [k]: v }))
      touch()
    },
    [setWeights, touch],
  )

  // ?detalle=top abre el desglose del mejor par
  useEffect(() => {
    if (params.get('detalle') === 'top' && top) {
      setOpenPair(top.member.id)
      params.delete('detalle')
      setParams(params, { replace: true })
    }
  }, [params, setParams, top])

  // Hooks para el Modo Trailer (mueve sliders y abre el desglose)
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail as { type: string; key?: CriterionKey; value?: number }
      if (d.type === 'weight' && d.key != null && d.value != null) setWeight(d.key, d.value)
      if (d.type === 'open-top' && top) setOpenPair(top.member.id)
      if (d.type === 'close') setOpenPair(null)
    }
    window.addEventListener('tl:matches', h)
    return () => window.removeEventListener('tl:matches', h)
  }, [setWeight, top])

  const reset = () => {
    setWeights(DEFAULT_WEIGHTS)
    setAdvanced(DEFAULT_ADVANCED)
    setFilters(DEFAULT_FILTERS)
    touch()
    toast(tr('Configuración restablecida', 'Settings restored'))
  }

  const pairRow = openPair ? ranked.find((r) => r.member.id === openPair) : undefined

  const propose = (b: Member) => {
    addPresented(selected.id, b.id)
    setProposed((p) => [...p, b.id])
    addAudit('Viviana', 'motor', {
      es: `Propuso presentar a ${selected.nombre} ${selected.apellido} y ${b.nombre} ${b.apellido}`,
      en: `Proposed introducing ${selected.nombre} ${selected.apellido} and ${b.nombre} ${b.apellido}`,
    })
    toast.success(tr(`Presentación propuesta: ${selected.nombre} y ${b.nombre}`, `Introduction proposed: ${selected.nombre} and ${b.nombre}`), {
      description: tr('Ambos reciben el aviso de nueva pareja sugerida.', 'Both receive the new suggested match notice.'),
    })
  }

  return (
    <div>
      <PageHeader
        title={tr('Motor de matches', 'Match engine')}
        subtitle={tr(
          'Configurá qué pesa más para la agencia y mirá cómo se recalculan las compatibilidades en vivo.',
          'Set what matters most to the agency and watch compatibilities recalculate live.',
        )}
        actions={
          <>
            <span className={cn('chip ring-1 ring-inset', saving ? 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400')}>
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
              {saving ? tr('Recalculando…', 'Recalculating…') : tr('Guardado · recalibración aplicada a próximos matches', 'Saved · recalibration applied to upcoming matches')}
            </span>
            <button className="btn-outline btn-sm" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" /> {tr('Restablecer', 'Reset')}
            </button>
          </>
        }
      />
      <PreviewBanner
        id="admin-matches"
        bullets={[
          tr('Pesos, rangos y filtros configurables sin tocar código.', 'Configurable weights, ranges and filters with no code.'),
          tr('Score 0-100 recalculado en tiempo real, con desglose explicado.', '0–100 score recalculated in real time, with an explained breakdown.'),
          tr('Suma notas de psicólogas, cuestionario, música y aprende de los rechazos.', 'Adds psychologist notes, questionnaire, music and learns from rejections.'),
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {/* ——— CONFIGURACIÓN ——— */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto lg:pr-1" data-trailer="match-weights">
          <div className="card p-5">
            <p className="label-xs">{tr('Pesos de compatibilidad', 'Compatibility weights')}</p>
            <div className="mt-4 space-y-4">
              {(Object.keys(weights) as CriterionKey[]).map((k) => (
                <div key={k} data-trailer={`weight-${k}`}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span>{CRITERIOS[k][lang]}</span>
                    <span className="num w-6 text-right text-accent">{weights[k]}</span>
                  </div>
                  <Slider value={[weights[k]]} onValueChange={([v]) => setWeight(k, v)} label={CRITERIOS[k][lang]} />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <p className="label-xs">{tr('Rangos', 'Ranges')}</p>
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span>{tr('Rango de edad aceptable', 'Acceptable age range')}</span>
                <span className="num text-accent">{filters.edadMin}–{filters.edadMax}</span>
              </div>
              <Slider
                value={[filters.edadMin, filters.edadMax]}
                min={28}
                max={55}
                onValueChange={([a, b]) => {
                  setFilters((f) => ({ ...f, edadMin: a, edadMax: b }))
                  touch()
                }}
                label={tr('Edad', 'Age')}
              />
            </div>
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span>{tr('Distancia máxima', 'Maximum distance')}</span>
                <span className="num text-accent">{filters.distanciaMax} km</span>
              </div>
              <Slider
                value={[filters.distanciaMax]}
                min={10}
                max={1200}
                step={10}
                onValueChange={([v]) => {
                  setFilters((f) => ({ ...f, distanciaMax: v }))
                  touch()
                }}
                label={tr('Distancia', 'Distance')}
              />
            </div>
          </div>

          <div className="card p-5">
            <p className="label-xs flex items-center gap-1.5"><Filter className="h-3 w-3" /> {tr('Filtros duros', 'Hard filters')}</p>
            <div className="mt-3 space-y-3">
              {(
                [
                  ['excluirRechazados', tr('Excluir rechazados', 'Exclude rejected')],
                  ['excluirPausa', tr('Excluir en pausa', 'Exclude paused')],
                  ['hijosExcluyente', tr('“Hijos” como excluyente', '“Children” as a dealbreaker')],
                  ['feExcluyente', tr('“Misma fe” como excluyente', '“Same faith” as a dealbreaker')],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                  {label}
                  <Switch
                    checked={filters[k]}
                    onCheckedChange={(v) => {
                      setFilters((f) => ({ ...f, [k]: v }))
                      touch()
                    }}
                    label={label}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <p className="label-xs flex items-center gap-1.5"><Brain className="h-3 w-3" /> {tr('Lógica avanzada', 'Advanced logic')}</p>
            <div className="mt-3 space-y-4">
              {(
                [
                  ['emocional', tr('Compatibilidad emocional (cuestionario)', 'Emotional compatibility (questionnaire)')],
                  ['notasPsico', tr('Considerar notas de la psicóloga', 'Consider psychologist notes')],
                  ['aprender', tr('Aprender de rechazos previos', 'Learn from previous rejections')],
                ] as const
              ).map(([k, label]) => (
                <div key={k}>
                  <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                    {label}
                    <Switch
                      checked={advanced[k].on}
                      onCheckedChange={(v) => {
                        setAdvanced((a) => ({ ...a, [k]: { ...a[k], on: v } }))
                        touch()
                      }}
                      label={label}
                    />
                  </label>
                  {advanced[k].on && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-muted">{tr('Peso', 'Weight')}</span>
                      <Slider
                        value={[advanced[k].peso]}
                        onValueChange={([v]) => {
                          setAdvanced((a) => ({ ...a, [k]: { ...a[k], peso: v } }))
                          touch()
                        }}
                        label={label}
                      />
                      <span className="num w-5 text-right text-xs text-accent">{advanced[k].peso}</span>
                    </div>
                  )}
                  {k === 'emocional' && advanced.emocional.on && (
                    <DevNotice
                      compact
                      className="mt-2"
                      title={tr('Análisis de texto libre', 'Free-text analysis')}
                      now={tr('Hoy comparamos respuestas cerradas;', 'Today we compare closed answers;')}
                      later={tr('al desarrollar se analiza también el texto libre del cuestionario.', 'once built, the questionnaire’s free text is analyzed too.')}
                    />
                  )}
                </div>
              ))}
              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                {tr('Evitar matches repetidos', 'Avoid repeated matches')}
                <Switch
                  checked={advanced.evitarRepetidos.on}
                  onCheckedChange={(v) => {
                    setAdvanced((a) => ({ ...a, evitarRepetidos: { on: v } }))
                    touch()
                  }}
                />
              </label>
            </div>
          </div>
        </aside>

        {/* ——— RESULTADOS ——— */}
        <section className="min-w-0">
          <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <MemberPhoto member={selected} size="md" />
            <div className="min-w-0 flex-1">
              <label className="label-xs" htmlFor="sel-member">{tr('Ver compatibilidades de:', 'View compatibilities for:')}</label>
              <select id="sel-member" className="input mt-1 h-9" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                {approved.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} {m.apellido} · {m.edad} · {m.ciudad}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-right text-xs text-muted sm:w-40">
              <p><span className="num text-base text-fg">{visible.filter((r) => !r.result.excluded).length}</span> {tr('candidatos compatibles', 'compatible candidates')}</p>
              <p>{visible.filter((r) => r.result.excluded).length} {tr('excluidos por filtros', 'excluded by filters')}</p>
            </div>
          </div>

          <motion.ul className="mt-3 space-y-2" layout>
            {visible.map((r, idx) => {
              const ex = r.result.excluded
              return (
                <motion.li
                  layout
                  key={r.member.id}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  data-trailer={idx === 0 ? 'top-pair' : undefined}
                  onClick={() => setOpenPair(r.member.id)}
                  className={cn(
                    'card flex cursor-pointer flex-col gap-3 p-3.5 transition-colors hover:border-accent/40 sm:flex-row sm:items-center',
                    ex && 'bg-surface-2 opacity-70',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MemberPhoto member={selected} size="sm" />
                    <RingsIcon className="h-4 w-5" />
                    <MemberPhoto member={r.member} size="sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {selected.nombre} <span className="font-normal text-muted">&</span> {r.member.nombre} {r.member.apellido}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {r.member.edad} · {PROFESIONES[r.member.profesion]?.[lang]} · {r.member.ciudad}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {ex ? (
                        <Badge tone="red"><Ban className="h-3 w-3" /> {ex.reason[lang]}</Badge>
                      ) : (
                        r.result.chips.map((c) => (
                          <span key={c.es} className="chip bg-accent-soft text-[11px] text-accent">
                            <Check className="h-3 w-3" /> {c[lang]}
                          </span>
                        ))
                      )}
                      {proposed.includes(r.member.id) && <Badge tone="blue">{tr('Presentación propuesta', 'Introduction proposed')}</Badge>}
                    </div>
                  </div>
                  <ScoreRing score={r.result.score} muted={!!ex} />
                </motion.li>
              )
            })}
          </motion.ul>

          <div className="card mt-4 p-5">
            <p className="label-xs flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> {tr('Sugerencias manuales de las psicólogas', 'Manual suggestions from psychologists')}</p>
            <ul className="mt-3 divide-y divide-border">
              {suggestions.map((s) => {
                const a = byId(s.aId)!
                const b = byId(s.bId)!
                return (
                  <li key={s.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <MemberPhoto member={a} size="xs" />
                    <RingsIcon className="h-3.5 w-4" />
                    <MemberPhoto member={b} size="xs" />
                    <span className="min-w-0 flex-1 truncate">
                      {a.nombre} & {b.nombre} <span className="text-muted">· {psicoById(s.psicologaId).nombre}</span>
                    </span>
                    <button className="text-xs font-semibold text-accent hover:underline" onClick={() => { setSelectedId(a.id); setOpenPair(b.id) }}>
                      {tr('Ver desglose', 'View breakdown')}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      </div>

      <Drawer
        open={!!pairRow}
        onOpenChange={(v) => !v && setOpenPair(null)}
        title={tr('Por qué son compatibles', 'Why they’re compatible')}
      >
        {pairRow && <Breakdown a={selected} row={pairRow} proposed={proposed.includes(pairRow.member.id)} onPropose={() => propose(pairRow.member)} />}
      </Drawer>
    </div>
  )
}

function Breakdown({ a, row, proposed, onPropose }: { a: Member; row: Row; proposed: boolean; onPropose: () => void }) {
  const tr = useTr()
  const { lang } = useLang()
  const { member: b, result } = row
  const factors = [...result.factors].sort((x, y) => y.points - x.points)
  const maxPts = Math.max(...factors.map((f) => (f.weight * 100) / factors.reduce((s, x) => s + x.weight, 0)), 1)
  return (
    <div data-trailer="breakdown">
      <div className="flex items-center gap-3">
        <MemberPhoto member={a} size="md" />
        <RingsIcon className="h-5 w-6" />
        <MemberPhoto member={b} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{a.nombre} & {b.nombre}</p>
          <p className="text-xs text-muted">{b.edad} · {b.ciudad}</p>
        </div>
        <ScoreRing score={result.score} size={72} muted={!!result.excluded} />
      </div>
      {result.excluded && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          <TriangleAlert className="h-4 w-4" /> {result.excluded.reason[lang]}
        </div>
      )}

      <p className="label-xs mt-6">{tr('Aporte por factor', 'Contribution by factor')}</p>
      <div className="mt-2 space-y-2">
        {factors.map((f) => {
          const max = (f.weight * 100) / factors.reduce((s, x) => s + x.weight, 0)
          return (
            <div key={f.key}>
              <div className="flex items-center justify-between text-xs">
                <span>{FACTOR_LABEL[f.key][lang]}</span>
                <span className="num text-muted">+{f.points.toFixed(1)} / {max.toFixed(1)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-surface-2" style={{ width: `${(max / maxPts) * 100}%` }}>
                <div className={cn('h-2 rounded-full', f.sim >= 0.75 ? 'bg-green-500' : f.sim >= 0.45 ? 'bg-amber-500' : 'bg-zinc-400')} style={{ width: `${f.sim * 100}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 space-y-1.5 rounded-lg border border-border p-3 text-sm">
        <div className="flex justify-between"><span className="text-muted">{tr('Base por criterios', 'Base from criteria')}</span><span className="num">{result.base.toFixed(1)}</span></div>
        <div className="flex justify-between"><span>{tr('Ajuste por evaluación psicológica', 'Psychological evaluation adjustment')}</span><span className={cn('num', result.psicoAdj >= 0 ? 'text-green-600' : 'text-red-600')}>{result.psicoAdj >= 0 ? '+' : '−'}{Math.abs(result.psicoAdj)}</span></div>
        {result.rejectPenalty > 0 && (
          <div className="flex justify-between"><span>{tr('Penalización por rechazos previos', 'Penalty from previous rejections')}</span><span className="num text-red-600">−{result.rejectPenalty}</span></div>
        )}
        <div className="flex justify-between border-t border-border pt-1.5 font-semibold"><span>{tr('Score final', 'Final score')}</span><span className="num">{result.score}</span></div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="label-xs !text-green-600">{tr('Coinciden', 'In common')}</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {result.coinciden.map((c) => (
              <li key={c.es} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />{c[lang]}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label-xs !text-amber-600">{tr('Divergen', 'Differ')}</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {result.divergen.length === 0 && <li className="text-muted">{tr('Sin diferencias relevantes', 'No relevant differences')}</li>}
            {result.divergen.map((c) => (
              <li key={c.es} className="flex gap-2"><TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />{c[lang]}</li>
            ))}
          </ul>
        </div>
      </div>

      <button className="btn-primary mt-6 h-11 w-full" disabled={!!result.excluded || proposed} onClick={onPropose}>
        <HeartHandshake className="h-4 w-4" /> {proposed ? tr('Presentación propuesta', 'Introduction proposed') : tr('Proponer presentación', 'Propose introduction')}
      </button>
      {proposed && (
        <DevNotice
          compact
          className="mt-3"
          title={tr('Notificación de nuevo match', 'New match notification')}
          now={tr('Ahora registramos la presentación en la demo.', 'We now record the introduction in the demo.')}
          later={tr('Al desarrollar, ambos miembros reciben el aviso por email y SMS.', 'Once built, both members get the notice by email and SMS.')}
        />
      )}
    </div>
  )
}
