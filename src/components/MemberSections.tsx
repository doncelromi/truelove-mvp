import { useState, type ReactNode } from 'react'
import { Star } from 'lucide-react'
import type { Member } from '@/data/types'
import { EDUCACION, ESTILO, FE, HIJOS, HOBBIES, INTENCION, LIKERT, POLITICA, PRACTICA, PROFESIONES, QUESTIONS, TAGS_PSICO, VALORES, tx } from '@/data/catalog'
import { useLang, useTr } from '@/lib/i18n'
import { useMemberActions } from '@/lib/actions'
import { DevNotice } from './Notices'
import { PhotoTile } from './MemberPhoto'
import { SongCard } from './SongCard'
import { CardHeader, Empty, Modal } from './ui'

export function Section({ title, subtitle, right, children, className }: { title: ReactNode; subtitle?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className ?? ''}`}>
      <CardHeader title={title} subtitle={subtitle} right={right} />
      <div className="p-5">{children}</div>
    </section>
  )
}

export function Gallery({ member }: { member: Member }) {
  const tr = useTr()
  const fotos = [...member.fotos].sort((a, b) => a.orden - b.orden)
  if (!fotos.length) return <Empty text={tr('Todavía no cargó fotos.', 'No photos uploaded yet.')} />
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {fotos.map((p) => (
        <div key={p.id} className="relative aspect-[4/5] overflow-hidden rounded-lg ring-1 ring-black/5 dark:ring-white/10">
          <PhotoTile member={member} photo={p} />
          {p.esPortada && (
            <span className="chip absolute left-1.5 top-1.5 bg-black/55 px-1.5 text-[10px] text-white backdrop-blur">
              <Star className="h-2.5 w-2.5 fill-current" /> {tr('Portada', 'Cover')}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export function Songs({ member }: { member: Member }) {
  const tr = useTr()
  const songs = [...member.canciones].sort((a, b) => a.orden - b.orden)
  if (!songs.length) return <Empty text={tr('Todavía no agregó canciones.', 'No songs added yet.')} />
  return (
    <div className="space-y-2">
      {songs.map((s) => (
        <SongCard key={s.id} song={s} />
      ))}
    </div>
  )
}

export function Facts({ member }: { member: Member }) {
  const { lang } = useLang()
  const tr = useTr()
  const rows: [string, string][] = [
    [tr('Profesión', 'Profession'), PROFESIONES[member.profesion]?.[lang] ?? member.profesion],
    [tr('Educación', 'Education'), tx(EDUCACION, member.educacion, lang)],
    [tr('Fe', 'Faith'), tx(FE, member.fe, lang)],
    [tr('Práctica religiosa', 'Religious practice'), tx(PRACTICA, member.practicaReligiosa, lang)],
    [tr('Intención', 'Intent'), tx(INTENCION, member.intencionCasarse, lang)],
    [tr('Hijos', 'Children'), tx(HIJOS, member.hijos, lang)],
    [tr('Estilo de vida', 'Lifestyle'), tx(ESTILO, member.estiloVida, lang)],
    [tr('Política', 'Politics'), member.politica ? tx(POLITICA, member.politica, lang) : '—'],
  ]
  return (
    <div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="label-xs">{k}</dt>
            <dd className="mt-0.5 text-sm font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4">
        <p className="label-xs">{tr('Valores', 'Values')}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {member.valores.map((v) => (
            <span key={v} className="chip bg-accent-soft text-accent">{VALORES[v]?.[lang] ?? v}</span>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <p className="label-xs">{tr('Hobbies', 'Hobbies')}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {member.hobbies.map((v) => (
            <span key={v} className="chip border border-border">{HOBBIES[v]?.[lang] ?? v}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function QuestionnaireAnswers({ member }: { member: Member }) {
  const { lang } = useLang()
  const tr = useTr()
  if (member.cuestionario.length === 0) return <Empty text={tr('Cuestionario sin empezar.', 'Questionnaire not started.')} />
  return (
    <div className="space-y-3">
      {QUESTIONS.map((q) => {
        const a = member.cuestionario.find((x) => x.qid === q.id)
        return (
          <div key={q.id}>
            <p className="text-sm">{q.text[lang]}</p>
            {a ? (
              <div className="mt-1 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`h-1.5 w-6 rounded-full ${n <= a.value ? 'bg-accent' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted">{LIKERT[a.value - 1][lang]}</span>
              </div>
            ) : (
              <p className="mt-1 text-xs text-muted">{tr('Sin responder', 'Not answered')}</p>
            )}
          </div>
        )
      })}
      <div className="rounded-lg bg-surface-2 p-3">
        <p className="label-xs">{tr('Respuesta libre', 'Open answer')}</p>
        <p className="mt-1 text-sm italic">“{member.textoLibre[lang]}”</p>
      </div>
    </div>
  )
}

export function PsicoTags({ member }: { member: Member }) {
  const { lang } = useLang()
  if (!member.etiquetasPsico.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {member.etiquetasPsico.map((t) => (
        <span key={t} className="chip bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{TAGS_PSICO[t]?.[lang] ?? t}</span>
      ))}
    </div>
  )
}

const MOTIVOS = [
  { es: 'No manifiesta intención matrimonial en el corto plazo.', en: 'No short-term marriage intent.' },
  { es: 'Inconsistencias entre el perfil y la entrevista.', en: 'Inconsistencies between profile and interview.' },
  { es: 'Situación personal no resuelta (separación reciente).', en: 'Unresolved personal situation (recent separation).' },
]

export function RejectModal({ member, open, onOpenChange }: { member: Member | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const tr = useTr()
  const { lang } = useLang()
  const { reject } = useMemberActions()
  const [motivo, setMotivo] = useState('')
  if (!member) return null
  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setMotivo('')
      }}
      title={tr(`Rechazar a ${member.nombre} ${member.apellido}`, `Reject ${member.nombre} ${member.apellido}`)}
      description={tr('El motivo queda registrado y se comparte con el candidato de forma cuidada.', 'The reason is recorded and shared with the candidate carefully.')}
    >
      <div className="flex flex-wrap gap-1.5">
        {MOTIVOS.map((m) => (
          <button key={m.es} className="chip border border-border text-left hover:border-accent" onClick={() => setMotivo(m[lang])}>
            {m[lang]}
          </button>
        ))}
      </div>
      <textarea
        className="input mt-3 h-24 py-2"
        placeholder={tr('Escribí el motivo…', 'Write the reason…')}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
      />
      {member.pago === 'ok' && (
        <DevNotice
          className="mt-3"
          compact
          title={tr('Reembolso', 'Refund')}
          now={tr('Ahora marcamos el pago como reembolsado.', 'We now mark the payment as refunded.')}
          later={tr('Al desarrollar, se devuelve el 100% automáticamente por Stripe.', 'Once built, 100% is refunded automatically through Stripe.')}
        />
      )}
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-outline" onClick={() => onOpenChange(false)}>{tr('Cancelar', 'Cancel')}</button>
        <button
          className="btn bg-red-600 text-white hover:bg-red-700"
          disabled={!motivo.trim()}
          onClick={() => {
            reject(member, motivo.trim())
            onOpenChange(false)
            setMotivo('')
          }}
        >
          {tr('Rechazar con motivo', 'Reject with reason')}
        </button>
      </div>
    </Modal>
  )
}
