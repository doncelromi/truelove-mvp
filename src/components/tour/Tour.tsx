import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MessageCircle, Sparkles } from 'lucide-react'
import { useLang, useTr } from '@/lib/i18n'
import { useSession } from '@/lib/session'
import { ss, ssSet, WHATSAPP_URL } from '@/lib/utils'
import { RingsIcon } from '../Logo'
import { getTourSteps } from './steps'

type Rect = { x: number; y: number; w: number; h: number }
const PAD = 8
const TIP_W = 360

export const tourKey = (role: string) => `tl_tour_completed_${role}`

function roundedRect({ x, y, w, h }: Rect, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  return `M${x + rr} ${y}H${x + w - rr}A${rr} ${rr} 0 0 1 ${x + w} ${y + rr}V${y + h - rr}A${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h}H${x + rr}A${rr} ${rr} 0 0 1 ${x} ${y + h - rr}V${y + rr}A${rr} ${rr} 0 0 1 ${x + rr} ${y}Z`
}

function visibleEl(selectors: string[] = []) {
  for (const s of selectors) {
    const els = Array.from(document.querySelectorAll<HTMLElement>(s))
    // getClientRects vacío = display:none (incluye ancestros ocultos por breakpoint); los fixed no tienen offsetParent
    const el = els.find((e) => e.getClientRects().length > 0 && e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== 'hidden')
    if (el) return el
  }
  return null
}

export default function Tour() {
  const { role, welcomeDone, tourNonce, trailer } = useSession()
  const { lang } = useLang()
  const tr = useTr()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const steps = useMemo(() => getTourSteps(role, lang), [role, lang])
  const [active, setActive] = useState(false)
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [done, setDone] = useState(false)
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight })
  const timers = useRef<number[]>([])
  const elRef = useRef<HTMLElement | null>(null)
  const lastNonce = useRef(tourNonce)

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  const teardown = useCallback(() => {
    clearTimers()
    elRef.current = null
    setRect(null)
    setActive(false)
  }, [])

  // Disparo automático: al cerrar el Welcome y en cada cambio de rol si no se completó
  useEffect(() => {
    if (trailer || !welcomeDone) return
    if (!ss(tourKey(role), false)) {
      setI(0)
      setDone(false)
      setActive(true)
    }
  }, [role, welcomeDone, trailer])

  // Botón ✨ Tour: relanza siempre
  useEffect(() => {
    if (tourNonce === lastNonce.current) return
    lastNonce.current = tourNonce
    setI(0)
    setDone(false)
    setActive(true)
  }, [tourNonce])

  const measure = useCallback(() => {
    const el = elRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setRect({ x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 })
  }, [])

  // Posicionar el paso actual
  useLayoutEffect(() => {
    if (!active) return
    clearTimers()
    const step = steps[i]
    if (!step) return
    if (step.route && pathname !== step.route.split('?')[0]) {
      navigate(step.route)
      return // se re-ejecuta al cambiar pathname
    }
    if (!step.targets) {
      elRef.current = null
      setRect(null)
      return
    }
    const locate = (retry: boolean) => {
      const el = visibleEl(step.targets)
      if (el) {
        elRef.current = el
        el.scrollIntoView({ block: 'center', inline: 'center' }) // CLAVE antes de medir
        timers.current.push(window.setTimeout(measure, 260))
      } else if (retry) {
        timers.current.push(window.setTimeout(() => locate(false), 220))
      } else {
        elRef.current = null
        setRect(null)
      }
    }
    timers.current.push(window.setTimeout(() => locate(true), 60))
    return clearTimers
  }, [active, i, steps, pathname, navigate, measure])

  // Re-medir en resize/scroll sin volver a hacer scrollIntoView
  useEffect(() => {
    if (!active) return
    const on = () => {
      setVp({ w: window.innerWidth, h: window.innerHeight })
      measure()
    }
    window.addEventListener('resize', on)
    window.addEventListener('scroll', on, true)
    return () => {
      window.removeEventListener('resize', on)
      window.removeEventListener('scroll', on, true)
    }
  }, [active, measure])

  useEffect(() => {
    if (!active) return
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1))
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  const finish = () => {
    teardown()
    ssSet(tourKey(role), true)
    setDone(true)
  }
  const next = () => (i >= steps.length - 1 ? finish() : setI(i + 1))

  if (done)
    return (
      <div className="fixed inset-0 z-[95]" onClick={() => setDone(false)}>
        <div className="fade-in absolute inset-0 bg-black/55 backdrop-blur-sm" />
        <div className="modal-center pop-in w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-surface p-7 text-center shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft"><RingsIcon className="h-6 w-7" /></span>
          <h2 className="mt-4 text-xl font-bold">{tr('¡Listo! Ya conocés tu plataforma', 'Done! Now you know your platform')}</h2>
          <p className="mt-2 text-sm text-muted">{tr('Recorrela a tu ritmo, cambiá de rol cuando quieras o relanzá el tour desde ✨ Tour.', 'Explore at your own pace, switch roles anytime or relaunch the tour from ✨ Tour.')}</p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button className="btn-outline h-11" onClick={() => setDone(false)}>{tr('Explorar por mi cuenta', 'Explore on my own')}</button>
            <a className="btn-primary h-11" href={WHATSAPP_URL} target="_blank" rel="noopener" onClick={() => setDone(false)}>
              <MessageCircle className="h-4 w-4" /> {tr('Quiero mi app →', 'I want my app →')}
            </a>
          </div>
        </div>
      </div>
    )

  if (!active) return null
  const step = steps[i]
  if (!step) return null

  // posición del tooltip
  const tipW = Math.min(TIP_W, vp.w - 32)
  let tipStyle: React.CSSProperties
  if (rect) {
    const below = rect.y + rect.h + 12
    const estH = 210
    const top = below + estH < vp.h ? below : Math.max(16, rect.y - estH - 12)
    const left = Math.min(Math.max(16, rect.x + rect.w / 2 - tipW / 2), vp.w - tipW - 16)
    tipStyle = { top, left, width: tipW }
  } else {
    tipStyle = { left: '50%', top: '50%', translate: '-50% -50%', width: tipW }
  }

  return (
    <div className="fixed inset-0 z-[90]" aria-live="polite">
      {/* fondo con agujero limpio: path evenodd (rectángulo completo + rectángulo redondeado del target) */}
      <svg className="absolute inset-0 h-full w-full" width={vp.w} height={vp.h}>
        <path fillRule="evenodd" fill="#0a0a0a" fillOpacity={0.55} d={`M0 0H${vp.w}V${vp.h}H0Z${rect ? roundedRect(rect, 12) : ''}`} />
      </svg>
      {rect && (
        <div
          className="pointer-events-none absolute rounded-xl transition-all duration-200"
          style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, boxShadow: '0 0 0 2px var(--accent), 0 0 24px 4px var(--accent-ring)' }}
        >
          <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500" />
          </span>
        </div>
      )}
      <div key={step.id} className="fade-in absolute rounded-2xl border border-border bg-surface p-5 shadow-2xl" style={tipStyle} role="dialog" aria-label={step.title}>
        <div className="flex items-center gap-2">
          <span className="chip bg-accent-soft text-[11px] font-semibold text-accent"><Sparkles className="h-3 w-3" /> {tr('Paso', 'Step')} {i + 1} / {steps.length}</span>
        </div>
        <h3 className="mt-2.5 text-[17px] font-bold tracking-tight">{step.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
        <div className="mt-4 flex items-center gap-2">
          <button className="text-xs font-medium text-muted hover:text-fg" onClick={finish}>{tr('Saltar tour', 'Skip tour')}</button>
          <div className="ml-auto flex gap-2">
            {i > 0 && <button className="btn-outline btn-sm" onClick={() => setI(i - 1)}>{tr('Atrás', 'Back')}</button>}
            <button className="btn-primary btn-sm" onClick={next}>{i >= steps.length - 1 ? tr('Finalizar', 'Finish') : tr('Siguiente', 'Next')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
