import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { CheckCircle2, Eye, Loader2, MapPin } from 'lucide-react'
import { MemberPhoto } from '@/components/MemberPhoto'
import { DevNotice, PreviewBanner } from '@/components/Notices'
import { SongCard } from '@/components/SongCard'
import { Badge, Modal, PageHeader, Tabs } from '@/components/ui'
import { CIUDADES, EDUCACION, ESTADOS_VALIDACION, ESTILO, FE, HIJOS, HOBBIES, INTENCION, LIKERT, POLITICA, PRACTICA, PROFESIONES, QUESTIONS, VALORES, tx } from '@/data/catalog'
import type { Member } from '@/data/types'
import { useLang, useTr, type Lang } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import MusicTab from './MusicTab'
import PhotosTab from './PhotosTab'

type TabKey = 'datos' | 'valores' | 'estilo' | 'historia' | 'bio' | 'fotos' | 'musica' | 'cuestionario'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

function Select<K extends string>({ value, map, onChange, lang }: { value: K; map: Record<K, { es: string; en: string }>; onChange: (v: K) => void; lang: Lang }) {
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value as K)}>
      {(Object.keys(map) as K[]).map((k) => (
        <option key={k} value={k}>{map[k][lang]}</option>
      ))}
    </select>
  )
}

function ChipPicker({ options, value, onChange, lang, max }: { options: Record<string, { es: string; en: string }>; value: string[]; onChange: (v: string[]) => void; lang: Lang; max?: number }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(options).map(([k, v]) => {
        const on = value.includes(k)
        return (
          <button
            key={k}
            type="button"
            onClick={() => onChange(on ? value.filter((x) => x !== k) : max && value.length >= max ? value : [...value, k])}
            className={cn('chip border py-1 transition-colors', on ? 'border-accent bg-accent text-white' : 'border-border hover:border-accent/60')}
          >
            {v[lang]}
          </button>
        )
      })}
    </div>
  )
}

export default function Perfil() {
  const tr = useTr()
  const { lang } = useLang()
  const [params, setParams] = useSearchParams()
  const { currentUserId, byId, updateMember } = useStore()
  const me = byId(currentUserId)!
  const tab = (params.get('tab') as TabKey) || 'datos'
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved'>('idle')
  const timer = useRef<number>()
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const patch = (p: Partial<Member>) => {
    updateMember(me.id, p)
    setSaving('saving')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setSaving('saved'), 600)
  }
  const setTab = (t: TabKey) => setParams({ tab: t }, { replace: true })
  const bi = (v: string) => ({ es: v, en: v })

  const tabs: { value: TabKey; label: string }[] = [
    { value: 'datos', label: tr('Datos personales', 'Personal info') },
    { value: 'valores', label: tr('Valores y proyecto', 'Values & plans') },
    { value: 'estilo', label: tr('Estilo de vida', 'Lifestyle') },
    { value: 'historia', label: tr('Historia', 'History') },
    { value: 'bio', label: tr('Biografía', 'Bio') },
    { value: 'fotos', label: tr('Fotos', 'Photos') },
    { value: 'musica', label: tr('Mi música', 'My music') },
    { value: 'cuestionario', label: tr('Cuestionario', 'Questionnaire') },
  ]
  const statusTone = me.estado === 'aprobado' ? 'green' : me.estado === 'rechazado' ? 'red' : me.estado === 'pendiente' ? 'amber' : 'gray'

  return (
    <div>
      <PageHeader
        title={tr('Mi perfil', 'My profile')}
        subtitle={tr('Contá quién sos y qué buscás. Todo lo que cargues es confidencial y solo lo ve la agencia y tus parejas sugeridas.', 'Tell us who you are and what you’re looking for. Everything is confidential and only seen by the agency and your suggested matches.')}
        actions={
          <button className="btn-outline" onClick={() => setPreview(true)}>
            <Eye className="h-4 w-4" /> {tr('Así te ven los demás', 'How others see you')}
          </button>
        }
      />
      <PreviewBanner
        id="user-perfil"
        bullets={[
          tr('Cada candidato arma su propio perfil, con fotos y canciones.', 'Each candidate builds their own profile, with photos and songs.'),
          tr('Valores, fe, hijos y cuestionario alimentan el motor de compatibilidad.', 'Values, faith, children and questionnaire feed the compatibility engine.'),
          tr('Autoguardado y estado de validación en todo momento.', 'Auto-save and validation status at all times.'),
        ]}
      />

      <div className="card mb-4 flex flex-wrap items-center gap-4 p-4">
        <MemberPhoto member={me} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold">{me.nombre} {me.apellido}, <span className="num">{me.edad}</span></p>
          <p className="flex items-center gap-1 text-sm text-muted"><MapPin className="h-3.5 w-3.5" />{me.ciudad}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge tone={statusTone}>{tr('Validación', 'Validation')}: {tx(ESTADOS_VALIDACION, me.estado, lang)}</Badge>
            <span className="flex items-center gap-1 text-xs text-muted">
              {saving === 'saving' ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 text-green-600" />}
              {saving === 'saving' ? tr('Guardando…', 'Saving…') : tr('Guardado', 'Saved')}
            </span>
          </div>
        </div>
        <div className="w-full sm:w-48">
          <div className="flex justify-between text-xs"><span className="text-muted">{tr('Perfil completo', 'Profile complete')}</span><span className="num">{me.completitud}%</span></div>
          <div className="mt-1 h-2 rounded-full bg-surface-2"><div className="h-2 rounded-full bg-accent" style={{ width: `${me.completitud}%` }} /></div>
        </div>
      </div>

      <Tabs value={tab} onChange={setTab} items={tabs} />

      <div className="card mt-4 p-5 sm:p-6">
        {tab === 'datos' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tr('Nombre', 'First name')}><input className="input" value={me.nombre} onChange={(e) => patch({ nombre: e.target.value })} /></Field>
            <Field label={tr('Apellido', 'Last name')}><input className="input" value={me.apellido} onChange={(e) => patch({ apellido: e.target.value })} /></Field>
            <Field label={tr('Edad', 'Age')}><input className="input num" type="number" min={28} max={60} value={me.edad} onChange={(e) => patch({ edad: Number(e.target.value) })} /></Field>
            <Field label={tr('Ciudad o barrio', 'City or neighborhood')}>
              <select className="input" value={me.ciudad} onChange={(e) => patch({ ciudad: e.target.value })}>{Object.keys(CIUDADES).map((c) => <option key={c}>{c}</option>)}</select>
            </Field>
            <Field label={tr('Profesión', 'Profession')}>
              <select className="input" value={me.profesion} onChange={(e) => patch({ profesion: e.target.value })}>{Object.entries(PROFESIONES).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}</select>
            </Field>
            <Field label={tr('Nivel educativo', 'Education level')}><Select value={me.educacion} map={EDUCACION} onChange={(v) => patch({ educacion: v })} lang={lang} /></Field>
          </div>
        )}
        {tab === 'valores' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tr('Fe', 'Faith')}><Select value={me.fe} map={FE} onChange={(v) => patch({ fe: v })} lang={lang} /></Field>
            <Field label={tr('Práctica religiosa', 'Religious practice')}><Select value={me.practicaReligiosa} map={PRACTICA} onChange={(v) => patch({ practicaReligiosa: v })} lang={lang} /></Field>
            <Field label={tr('Intención de casarse y plazo', 'Marriage intent & timeline')}><Select value={me.intencionCasarse} map={INTENCION} onChange={(v) => patch({ intencionCasarse: v })} lang={lang} /></Field>
            <Field label={tr('Hijos', 'Children')}><Select value={me.hijos} map={HIJOS} onChange={(v) => patch({ hijos: v })} lang={lang} /></Field>
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-medium">{tr('Valores familiares (hasta 5)', 'Family values (up to 5)')}</p>
              <ChipPicker options={VALORES} value={me.valores} onChange={(v) => patch({ valores: v })} lang={lang} max={5} />
            </div>
            <Field label={tr('Afinidad política (opcional)', 'Political affinity (optional)')}>
              <select className="input" value={me.politica ?? ''} onChange={(e) => patch({ politica: (e.target.value || undefined) as Member['politica'] })}>
                <option value="">{tr('Prefiero no responder', 'Prefer not to answer')}</option>
                {Object.entries(POLITICA).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
              </select>
            </Field>
          </div>
        )}
        {tab === 'estilo' && (
          <div className="space-y-5">
            <Field label={tr('Estilo de vida', 'Lifestyle')}><Select value={me.estiloVida} map={ESTILO} onChange={(v) => patch({ estiloVida: v })} lang={lang} /></Field>
            <div>
              <p className="mb-2 text-sm font-medium">{tr('Hobbies e intereses', 'Hobbies & interests')}</p>
              <ChipPicker options={HOBBIES} value={me.hobbies} onChange={(v) => patch({ hobbies: v })} lang={lang} max={6} />
            </div>
          </div>
        )}
        {tab === 'historia' && (
          <div className="space-y-4">
            <Field label={tr('Historia de relaciones', 'Relationship history')}><textarea className="input h-28 py-2" value={me.historia[lang]} onChange={(e) => patch({ historia: bi(e.target.value) })} /></Field>
            <Field label={tr('Aspiraciones', 'Aspirations')}><textarea className="input h-24 py-2" value={me.aspiraciones[lang]} onChange={(e) => patch({ aspiraciones: bi(e.target.value) })} /></Field>
          </div>
        )}
        {tab === 'bio' && (
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <Field label={tr('Tu biografía', 'Your bio')}>
                <textarea className="input h-56 py-2 leading-relaxed" maxLength={600} value={me.bio[lang]} onChange={(e) => patch({ bio: bi(e.target.value) })} placeholder={tr('Contá quién sos, qué te apasiona y qué familia soñás formar…', 'Tell us who you are, what you love and the family you dream of…')} />
              </Field>
              <p className="mt-1 text-right text-xs text-muted"><span className="num">{me.bio[lang].length}</span>/600</p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium">{tr('Vista previa', 'Preview')}</p>
              <div className="rounded-xl border border-border bg-surface-2 p-4">
                <div className="flex items-center gap-3"><MemberPhoto member={me} size="md" /><p className="font-semibold">{me.nombre}, <span className="num">{me.edad}</span></p></div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{me.bio[lang] || <span className="text-muted">{tr('Tu biografía aparecerá acá.', 'Your bio will appear here.')}</span>}</p>
              </div>
            </div>
          </div>
        )}
        {tab === 'fotos' && <PhotosTab member={me} />}
        {tab === 'musica' && <MusicTab member={me} />}
        {tab === 'cuestionario' && (
          <div>
            <p className="text-sm text-muted">{tr('No hay respuestas correctas: respondé con honestidad. Se guarda automáticamente.', 'There are no right answers: be honest. It saves automatically.')}</p>
            <div className="mt-4 space-y-5">
              {QUESTIONS.map((q, qi) => {
                const val = me.cuestionario.find((a) => a.qid === q.id)?.value
                return (
                  <div key={q.id}>
                    <p className="text-sm font-medium"><span className="num mr-1.5 text-accent">{qi + 1}.</span>{q.text[lang]}</p>
                    <div className="mt-2 grid grid-cols-5 gap-1.5">
                      {LIKERT.map((l, i) => (
                        <button
                          key={i}
                          onClick={() => patch({ cuestionario: [...me.cuestionario.filter((a) => a.qid !== q.id), { qid: q.id, value: i + 1 }] })}
                          className={cn('rounded-lg border px-1 py-2 text-[11px] leading-tight transition-colors sm:text-xs', val === i + 1 ? 'border-accent bg-accent text-white' : 'border-border hover:border-accent/60')}
                        >
                          {l[lang]}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
              <Field label={tr('Con tus palabras: ¿qué es para vos el amor en pareja?', 'In your own words: what is love in a relationship to you?')}>
                <textarea className="input h-24 py-2" value={me.textoLibre[lang]} onChange={(e) => patch({ textoLibre: bi(e.target.value) })} />
              </Field>
              <DevNotice
                compact
                title={tr('Análisis de texto libre del cuestionario', 'Questionnaire free-text analysis')}
                now={tr('Hoy el motor usa tus respuestas cerradas.', 'Today the engine uses your closed answers.')}
                later={tr('Al desarrollar, también analiza tu respuesta libre.', 'Once built, it also analyzes your open answer.')}
              />
            </div>
          </div>
        )}
      </div>
      {tab !== 'fotos' && tab !== 'musica' && tab !== 'cuestionario' && (
        <div className="mt-3 flex justify-end">
          <button className="btn-primary" onClick={() => toast.success(tr('Perfil guardado', 'Profile saved'))}>{tr('Guardar cambios', 'Save changes')}</button>
        </div>
      )}

      <Modal open={preview} onOpenChange={setPreview} title={tr('Así te ven los demás', 'How others see you')} className="max-w-md">
        <MemberPhoto member={me} size="card" />
        <p className="mt-4 text-xl font-bold">{me.nombre}, <span className="num">{me.edad}</span></p>
        <p className="text-sm text-muted">{PROFESIONES[me.profesion]?.[lang]} · {me.ciudad}</p>
        <p className="mt-3 text-sm leading-relaxed">{me.bio[lang]}</p>
        <div className="mt-4 space-y-2">
          {[...me.canciones].sort((a, b) => a.orden - b.orden).slice(0, 3).map((s) => <SongCard key={s.id} song={s} compact />)}
        </div>
      </Modal>
    </div>
  )
}
