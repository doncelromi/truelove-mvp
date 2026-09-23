import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, MousePointer2, X } from 'lucide-react'
import type { Role } from '@/data/types'
import { MARTIN_ID } from '@/data/members'
import { useLang } from '@/lib/i18n'
import { useSession } from '@/lib/session'
import { useStore } from '@/lib/store'
import { WHATSAPP_URL } from '@/lib/utils'
import { RingsIcon } from '../Logo'

export type TrailerScene = {
  view?: string
  role?: Role
  selector?: string
  click?: boolean
  position?: 'top' | 'bottom' | 'center'
  chapter: string
  title: string
  body: string
  duration: number
  cta?: boolean
  action?: 'slider' | 'onboarding' | 'reorder'
}

type Bi = [string, string]
type SceneDef = Omit<TrailerScene, 'chapter' | 'title' | 'body'> & { chapter: Bi; title: Bi; body: Bi }

const SCENES: SceneDef[] = [
  { view: '/propuesta', selector: '[data-trailer="circuit"]', duration: 7000, chapter: ['Propuesta', 'Proposal'], title: ['Todo lo que incluye tu plataforma', 'Everything your platform includes'], body: ['El circuito completo: cuenta, perfil, entrevista, motor de compatibilidad y presentación.', 'The full journey: account, profile, interview, compatibility engine and introduction.'] },
  { view: '/admin/panel', role: 'admin', selector: '[data-trailer="kpis"]', duration: 7000, chapter: ['Administradora', 'Administrator'], title: ['Tu agencia de un vistazo', 'Your agency at a glance'], body: ['214 miembros activos, 18 entrevistas esta semana y 37 parejas presentadas este mes.', '214 active members, 18 interviews this week and 37 couples introduced this month.'] },
  { view: '/admin/usuarios', role: 'admin', selector: '[data-tab="pendiente"]', click: true, duration: 7000, chapter: ['Administradora', 'Administrator'], title: ['Candidatos por estado', 'Candidates by status'], body: ['Un clic en “Pendientes” y ves quién espera entrevista o decisión.', 'One click on “Pending” shows who’s waiting for an interview or decision.'] },
  { view: '/admin/matches', role: 'admin', selector: '[data-trailer="weight-intencion"]', action: 'slider', duration: 9000, chapter: ['Motor de matches', 'Match engine'], title: ['Vos decidís qué pesa más', 'You decide what matters most'], body: ['Bajás “Intención de casarse” y los scores se recalculan y reordenan en vivo.', 'Lower “Marriage intent” and scores recalculate and reorder live.'] },
  { view: '/admin/matches', role: 'admin', selector: '[data-trailer="top-pair"]', click: true, duration: 8500, position: 'top', chapter: ['Motor de matches', 'Match engine'], title: ['Cada score, explicado', 'Every score, explained'], body: ['Javier y Lucía: 94. Qué coincide, qué diverge y el ajuste de la psicóloga.', 'Javier and Lucía: 94. What matches, what differs and the psychologist’s adjustment.'] },
  { view: '/psico/agenda', role: 'psico', selector: '[data-trailer="psico-week"]', duration: 7000, chapter: ['Psicóloga', 'Psychologist'], title: ['La semana de la psicóloga', 'The psychologist’s week'], body: ['Turnos por estado, horarios libres y el panel de hoy, con videollamada integrada.', 'Appointments by status, free slots and today’s panel, with built-in video call.'] },
  { view: 'INTERVIEW', role: 'psico', selector: '[data-trailer="interview-panel"]', duration: 8000, chapter: ['Psicóloga', 'Psychologist'], title: ['Notas que ajustan el score', 'Notes that adjust the score'], body: ['Notas con autoguardado, etiquetas profesionales y el resultado: Aprobado, En espera o Rechazado.', 'Auto-saved notes, professional tags and the outcome: Approved, On hold or Rejected.'] },
  { view: '/mi/onboarding', role: 'user', selector: '[data-trailer="onboarding-bar"]', action: 'onboarding', duration: 7000, chapter: ['Candidato', 'Candidate'], title: ['Onboarding en 5 pasos', '5-step onboarding'], body: ['Cuenta, pago, perfil, entrevista y aprobación. La barra avanza sin saltear pasos.', 'Account, payment, profile, interview and approval. The bar moves forward, no skipping.'] },
  { view: '/mi/perfil?tab=fotos', role: 'user', selector: '[data-trailer="photo-gallery"]', action: 'reorder', duration: 8000, position: 'top', chapter: ['Candidato', 'Candidate'], title: ['Sus propias fotos', 'Their own photos'], body: ['Sube sus fotos, elige la portada y las ordena arrastrando.', 'Uploads photos, picks the cover and sorts them by dragging.'] },
  { view: '/mi/perfil?tab=musica', role: 'user', selector: '[data-trailer="add-song"]', click: true, duration: 7000, chapter: ['Candidato', 'Candidate'], title: ['Las canciones que lo representan', 'The songs that represent them'], body: ['Tres temas, una “canción ideal” y la frase de por qué la eligió.', 'Three songs, an “ideal song” and a line on why they chose it.'] },
  { view: '/mi/matches', role: 'user', selector: '[data-trailer="user-top-match"]', duration: 7000, position: 'top', chapter: ['Candidato', 'Candidate'], title: ['Parejas sugeridas', 'Suggested matches'], body: ['Valentina al 91%: “Comparten gustos musicales” y quieren casarse en menos de 2 años.', 'Valentina at 91%: “Share musical taste” and both want to marry within 2 years.'] },
  { cta: true, duration: 8500, position: 'center', chapter: ['Insights', 'Insights'], title: ['Agencia True Love, lista para lanzar', 'Agencia True Love, ready to launch'], body: ['Prototipo en 3 semanas. Plataforma completa en 2,5 meses.', 'Prototype in 3 weeks. Complete platform in 2.5 months.'] },
]

/** Ruta /trailer: arranca el modo trailer sin credenciales */
export default function TrailerStart() {
  const { setTrailer } = useSession()
  const navigate = useNavigate()
  useEffect(() => {
    setTrailer(true)
    navigate('/propuesta', { replace: true })
  }, [setTrailer, navigate])
  return null
}

type Box = { x: number; y: number; w: number; h: number }

export function TrailerOverlay() {
  const { trailer, setTrailer, setRole } = useSession()
  const { lang } = useLang()
  const navigate = useNavigate()
  const { interviews, byId, reorderPhotos, setOnboardingStep } = useStore()
  const [idx, setIdx] = useState(0)
  const [box, setBox] = useState<Box | null>(null)
  const [cursor, setCursor] = useState({ x: window.innerWidth / 2, y: window.innerHeight - 40 })
  const [clicking, setClicking] = useState(false)
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const interviewRoute = useMemo(() => {
    const iv = interviews.find((i) => i.memberId === MARTIN_ID && i.estado === 'agendada') ?? interviews.find((i) => i.psicologaId === 'p1')
    return `/psico/entrevistas/${iv?.id ?? ''}`
  }, [interviews])

  const exit = useCallback(() => {
    clear()
    window.dispatchEvent(new CustomEvent('tl:matches', { detail: { type: 'weight', key: 'intencion', value: 9 } }))
    setTrailer(false)
    setIdx(0)
    navigate('/login')
  }, [setTrailer, navigate])

  useEffect(() => {
    if (!trailer) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && exit()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [trailer, exit])

  // guion de cada escena
  useEffect(() => {
    if (!trailer) return
    clear()
    const s = SCENES[idx]
    setBox(null)
    if (s.role) setRole(s.role)
    if (s.view) navigate(s.view === 'INTERVIEW' ? interviewRoute : s.view)
    if (idx === 3 || idx === 4) window.dispatchEvent(new CustomEvent('tl:matches', { detail: { type: 'weight', key: 'intencion', value: 9 } }))
    if (s.action === 'onboarding') setOnboardingStep(4)

    const locate = (tries: number) => {
      if (!s.selector) return
      const el = Array.from(document.querySelectorAll<HTMLElement>(s.selector)).find((e) => e.getClientRects().length > 0)
      if (!el) {
        if (tries > 0) later(() => locate(tries - 1), 350)
        return
      }
      el.scrollIntoView({ block: s.position === 'top' ? 'start' : 'center', behavior: 'smooth' })
      later(() => {
        const r = el.getBoundingClientRect()
        const b = { x: r.left - 6, y: r.top - 6, w: r.width + 12, h: r.height + 12 }
        setBox(b)
        const target = { x: r.left + Math.min(r.width / 2, 160), y: r.top + Math.min(r.height / 2, 60) }
        setCursor(target)
        if (s.click) {
          later(() => {
            setClicking(true)
            el.click()
            later(() => setClicking(false), 350)
          }, 1100)
        }
        if (s.action === 'slider') {
          const thumb = el.querySelector<HTMLElement>('[role="slider"]')
          const tr = thumb?.getBoundingClientRect()
          const track = el.getBoundingClientRect()
          if (tr) setCursor({ x: tr.left + tr.width / 2, y: tr.top + tr.height / 2 })
          const values = [8, 7, 6, 5, 4, 3, 2]
          values.forEach((v, k) =>
            later(() => {
              window.dispatchEvent(new CustomEvent('tl:matches', { detail: { type: 'weight', key: 'intencion', value: v } }))
              if (tr) setCursor({ x: track.left + (track.width * v) / 10, y: tr.top + tr.height / 2 })
            }, 1300 + k * 420),
          )
        }
        if (s.action === 'onboarding') later(() => window.dispatchEvent(new Event('tl:onboarding-next')), 2200)
        if (s.action === 'reorder') {
          const m = byId(MARTIN_ID)
          if (m && m.fotos.length > 1) {
            const ids = [...m.fotos].sort((a, b) => a.orden - b.orden).map((p) => p.id)
            later(() => reorderPhotos(MARTIN_ID, [...ids.slice(1), ids[0]]), 2000)
            later(() => reorderPhotos(MARTIN_ID, ids), 4800)
          }
        }
      }, 450)
    }
    later(() => locate(8), 700)
    later(() => setIdx((i) => (i + 1) % SCENES.length), s.duration)
    return clear
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trailer, idx])

  if (!trailer) return null
  const s = SCENES[idx]
  const L = (b: Bi) => (lang === 'es' ? b[0] : b[1])

  return (
    <>
      {/* bloquea la interacción manual mientras corre */}
      <div className="fixed inset-0 z-[9990]" />
      {box && !s.cta && (
        <div
          className="pointer-events-none fixed z-[9991] rounded-xl transition-all duration-500"
          style={{ left: box.x, top: box.y, width: box.w, height: box.h, boxShadow: '0 0 0 3px var(--accent), 0 0 0 9px var(--accent-ring)' }}
        />
      )}
      {!s.cta && (
        <div className="pointer-events-none fixed z-[9993] transition-all duration-700 ease-out" style={{ left: cursor.x, top: cursor.y }}>
          <span className={`absolute -left-4 -top-4 h-8 w-8 rounded-full bg-blue-500/30 transition-all ${clicking ? 'scale-150 opacity-100' : 'scale-50 opacity-0'}`} />
          <MousePointer2 className="h-6 w-6 fill-blue-500 text-white drop-shadow-lg" />
        </div>
      )}
      {s.cta ? (
        <div className="fixed inset-0 z-[9992] bg-black/60 backdrop-blur-md">
          <div className="modal-center pop-in w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-white/10 bg-surface p-8 text-center shadow-2xl">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft"><RingsIcon className="h-7 w-8" /></span>
            <h2 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">{L(s.title)}</h2>
            <p className="mt-2 text-muted">{L(s.body)}</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn-primary relative z-[9994] mt-6 h-12 w-full text-base">
              <MessageCircle className="h-5 w-5" /> {lang === 'es' ? 'Quiero arrancar' : 'Let’s get started'}
            </a>
            <p className="mt-3 text-[10px] text-muted">Powered by Insights</p>
          </div>
        </div>
      ) : (
        <div className={`pointer-events-none fixed inset-x-0 z-[9992] flex justify-center px-4 ${s.position === 'top' ? 'bottom-6' : 'bottom-6'}`}>
          <div key={idx} className="fade-in w-full max-w-xl rounded-2xl border border-white/20 bg-black/55 p-4 text-white shadow-2xl backdrop-blur-xl sm:p-5">
            <div className="flex items-center gap-2">
              <span className="chip bg-white/15 text-[10.5px] font-bold uppercase tracking-wider">{L(s.chapter)}</span>
              <span className="num ml-auto text-xs text-white/60">{idx + 1}/{SCENES.length}</span>
            </div>
            <p className="mt-2 text-lg font-bold leading-snug">{L(s.title)}</p>
            <p className="mt-1 text-sm text-white/80">{L(s.body)}</p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/15">
              <div key={idx} className="h-1 rounded-full bg-[#F0587F]" style={{ animation: `tl-progress ${s.duration}ms linear forwards` }} />
            </div>
          </div>
        </div>
      )}
      <button onClick={exit} className="fixed right-4 top-4 z-[9994] flex h-10 items-center gap-1.5 rounded-full bg-black/60 px-3 text-sm font-medium text-white backdrop-blur hover:bg-black/75" aria-label="Exit">
        <X className="h-4 w-4" /> {lang === 'es' ? 'Salir · Esc' : 'Exit · Esc'}
      </button>
    </>
  )
}
