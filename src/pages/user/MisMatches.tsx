import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Check, ChevronDown, Heart, Info, Music, TriangleAlert, X } from 'lucide-react'
import { RingsIcon } from '@/components/Logo'
import { MemberPhoto } from '@/components/MemberPhoto'
import { PreviewBanner } from '@/components/Notices'
import { Badge, PageHeader, ScoreRing } from '@/components/ui'
import { PROFESIONES } from '@/data/catalog'
import { useLang, useTr } from '@/lib/i18n'
import { rankFor } from '@/lib/score'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function MisMatches() {
  const tr = useTr()
  const { lang } = useLang()
  const { currentUserId, byId, members, weights, advanced, filters, scoreCtx, decisions, decide } = useStore()
  const me = byId(currentUserId)!
  const [open, setOpen] = useState<string | null>(null)
  // las decisiones previas del usuario no penalizan su propia lista actual: se calcula con su estado base
  const ranked = useMemo(
    () => rankFor({ ...me, rechazados: me.rechazados.filter((r) => !decisions[r]) }, members, weights, advanced, filters, scoreCtx).filter((r) => !r.result.excluded).slice(0, 4),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [me.id, members, weights, advanced, filters, scoreCtx],
  )

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={tr('Tus parejas sugeridas', 'Your suggested matches')} subtitle={tr('Elegidas por compatibilidad real: valores, fe, proyecto de vida, música y la mirada de tu psicóloga.', 'Chosen for real compatibility: values, faith, life plans, music and your psychologist’s view.')} />
      <PreviewBanner
        id="user-matches"
        bullets={[
          tr('Recibís pocas presentaciones, pero muy compatibles.', 'You get few introductions, but highly compatible ones.'),
          tr('Cada una explica por qué son compatibles.', 'Each one explains why you’re compatible.'),
          tr('Tu respuesta afina las próximas sugerencias.', 'Your answer fine-tunes future suggestions.'),
        ]}
      />
      {me.estado !== 'aprobado' && (
        <div className="mb-4 flex gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
          <Info className="h-4 w-4 shrink-0" />
          {tr('Sugerencias preliminares: se confirman cuando tu psicóloga apruebe tu perfil.', 'Preliminary suggestions: they’re confirmed once your psychologist approves your profile.')}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {ranked.map(({ member: m, result }, i) => {
          const ideal = m.canciones.find((s) => s.esCancionIdeal)
          const d = decisions[m.id]
          const isOpen = open === m.id
          return (
            <article key={m.id} className={cn('card overflow-hidden', d === 'no' && 'opacity-60')} data-trailer={i === 0 ? 'user-top-match' : undefined}>
              <div className="relative">
                <MemberPhoto member={m} size="card" className="!aspect-[16/10] rounded-none" />
                <div className="absolute right-3 top-3 rounded-full bg-surface/95 p-1 shadow backdrop-blur">
                  <ScoreRing score={result.score} size={58} />
                </div>
                {d && (
                  <span className="absolute left-3 top-3">
                    <Badge tone={d === 'interesa' ? 'green' : 'gray'}>{d === 'interesa' ? tr('Te interesa', 'You’re interested') : tr('No avanzás', 'Not moving forward')}</Badge>
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <RingsIcon className="h-4 w-5" />
                  <h3 className="text-lg font-bold">{m.nombre}, <span className="num">{m.edad}</span></h3>
                </div>
                <p className="text-sm text-muted">{PROFESIONES[m.profesion]?.[lang]} · {m.ciudad}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {result.chips.map((c) => (
                    <span key={c.es} className="chip bg-accent-soft text-accent"><Check className="h-3 w-3" /> {c[lang]}</span>
                  ))}
                </div>
                {ideal && (
                  <p className="mt-3 flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-sm">
                    <Music className="h-4 w-4 shrink-0 text-accent" />
                    <span className="min-w-0 truncate">{tr('Su canción ideal', 'Their ideal song')}: <b>{ideal.titulo}</b> — {ideal.artista}</span>
                  </p>
                )}
                <button className="mt-3 flex w-full items-center justify-between text-sm font-semibold text-accent" onClick={() => setOpen(isOpen ? null : m.id)}>
                  {tr('Por qué son compatibles', 'Why you’re compatible')}
                  <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <div className="mt-2 space-y-1.5 text-sm">
                    {result.coinciden.slice(0, 5).map((c) => <p key={c.es} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />{c[lang]}</p>)}
                    {result.divergen.slice(0, 2).map((c) => <p key={c.es} className="flex gap-2 text-muted"><TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />{c[lang]}</p>)}
                  </div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    className={cn('btn', d === 'interesa' ? 'bg-green-600 text-white' : 'bg-accent text-white hover:bg-accent-hover')}
                    onClick={() => { decide(m.id, 'interesa'); toast.success(tr(`¡Genial! Le avisamos a la agencia que te interesa conocer a ${m.nombre}.`, `Great! We told the agency you’d like to meet ${m.nombre}.`)) }}
                  >
                    <Heart className="h-4 w-4" /> {tr('Me interesa', 'I’m interested')}
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => { decide(m.id, 'no'); toast(tr('Lo tendremos en cuenta para tus próximas sugerencias', 'We’ll take it into account for your next suggestions')) }}
                  >
                    <X className="h-4 w-4" /> {tr('Prefiero no avanzar', 'I’d rather not')}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
