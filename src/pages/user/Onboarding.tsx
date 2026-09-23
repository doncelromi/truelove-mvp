import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Camera, Check, ChevronDown, CreditCard, Lock, MailCheck, Music, PartyPopper, Sparkles, UserRound, Video } from 'lucide-react'
import { RingsIcon } from '@/components/Logo'
import { DevNotice, PreviewBanner } from '@/components/Notices'
import { PageHeader } from '@/components/ui'
import { freeSlots } from '@/data/ops'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import { cn, fmtUSD } from '@/lib/utils'

export default function Onboarding() {
  const tr = useTr()
  const { lang } = useLang()
  const { currentUserId, byId, onboardingStep, setOnboardingStep, updateMember, interviews, setInterviews, setTransactions, membershipPrice } = useStore()
  const me = byId(currentUserId)!
  const step = onboardingStep // 1..5 actual, 6 = aprobado
  const [open, setOpen] = useState<number>(Math.min(step, 5))
  const myIv = interviews.find((i) => i.memberId === me.id && i.estado === 'agendada')
  const [slot, setSlot] = useState<string>(myIv?.fecha ?? '')

  useEffect(() => setOpen(Math.min(step, 5)), [step])

  // Modo Trailer: avanza la barra
  useEffect(() => {
    const h = () => simulateApproval()
    window.addEventListener('tl:onboarding-next', h)
    return () => window.removeEventListener('tl:onboarding-next', h)
  })

  const pay = () => {
    updateMember(me.id, { pago: 'ok' })
    setTransactions((t) => [{ id: `TL-${2061 + t.length}`, memberId: me.id, monto: membershipPrice, estado: 'aprobado', fecha: new Date().toISOString() }, ...t])
    setOnboardingStep(3)
    toast.success(tr('Pago aprobado. ¡Ya podés completar tu perfil!', 'Payment approved. You can now complete your profile!'))
  }
  const confirmSlot = () => {
    if (!slot) return
    if (myIv) setInterviews((l) => l.map((i) => (i.id === myIv.id ? { ...i, fecha: slot } : i)))
    else setInterviews((l) => [...l, { id: `iv${l.length + 1}`, memberId: me.id, psicologaId: me.psicologaId, fecha: slot, modalidad: 'zoom', estado: 'agendada' }])
    if (step === 4) setOnboardingStep(5)
    toast.success(tr('Turno confirmado. Te enviamos el recordatorio 24 h antes.', 'Appointment confirmed. We’ll remind you 24h before.'))
  }
  function simulateApproval() {
    if (step < 4) return
    if (step === 4) {
      setOnboardingStep(5)
      return
    }
    setOnboardingStep(6)
    updateMember(me.id, { estado: 'aprobado' })
    toast.success(tr('¡Fuiste aprobado! Ya podés recibir parejas sugeridas.', 'You’ve been approved! You can now receive suggested matches.'))
  }

  const steps = [
    { n: 1, icon: MailCheck, title: tr('Cuenta creada y email verificado', 'Account created and email verified') },
    { n: 2, icon: CreditCard, title: tr('Pago de membresía', 'Membership payment') },
    { n: 3, icon: UserRound, title: tr('Tu perfil, tus fotos y tus canciones', 'Your profile, photos and songs') },
    { n: 4, icon: Video, title: tr('Entrevista con tu psicóloga', 'Interview with your psychologist') },
    { n: 5, icon: RingsIcon, title: tr('Aprobación', 'Approval') },
  ]
  const pct = Math.round((Math.min(step - 1, 5) / 5) * 100)

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={tr(`Hola ${me.nombre}, este es tu camino`, `Hi ${me.nombre}, this is your journey`)} subtitle={tr('Cinco pasos cuidados para llegar a tus parejas sugeridas. Podés retomar donde quedaste cuando quieras.', 'Five careful steps to reach your suggested matches. Resume where you left off anytime.')} />
      <PreviewBanner
        id="user-onboarding"
        bullets={[
          tr('Cada candidato avanza paso a paso, sin saltearse ninguno.', 'Each candidate moves step by step, no skipping.'),
          tr('El pago desbloquea el perfil y la entrevista.', 'Payment unlocks the profile and the interview.'),
          tr('Respuesta de la entrevista en 48 h, con motivo si no es aprobado.', 'Interview answer within 48h, with a reason if not approved.'),
        ]}
      />

      <div className="card p-5" data-trailer="onboarding-bar">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{step >= 6 ? tr('¡Camino completo!', 'Journey complete!') : tr(`Paso ${step} de 5`, `Step ${step} of 5`)}</span>
          <span className="num text-accent">{pct}%</span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {steps.map((s) => (
            <div key={s.n} className="h-2 overflow-hidden rounded-full bg-surface-2">
              <motion.div className="h-2 rounded-full bg-accent" initial={false} animate={{ width: step > s.n ? '100%' : step === s.n ? '45%' : '0%' }} transition={{ duration: 0.6 }} />
            </div>
          ))}
        </div>
        <div className="mt-2 hidden grid-cols-5 gap-1.5 text-[11px] text-muted sm:grid">
          {[tr('Cuenta', 'Account'), tr('Pago', 'Payment'), tr('Perfil', 'Profile'), tr('Entrevista', 'Interview'), tr('Aprobación', 'Approval')].map((l, k) => (
            <span key={l} className={cn(step >= k + 1 && 'font-medium text-fg')}>{k + 1}. {l}</span>
          ))}
        </div>
      </div>

      {step >= 6 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card mt-4 flex items-center gap-4 border-green-300 bg-green-50 p-5 dark:border-green-500/30 dark:bg-green-500/10">
          <PartyPopper className="h-8 w-8 text-green-600" />
          <div className="flex-1">
            <p className="text-lg font-bold">{tr('¡Fuiste aprobado!', 'You’ve been approved!')}</p>
            <p className="text-sm text-muted">{tr('Tu psicóloga confirmó tu perfil. Ya estás en el motor de compatibilidad.', 'Your psychologist confirmed your profile. You’re now in the compatibility engine.')}</p>
          </div>
          <Link to="/mi/matches" className="btn-primary">{tr('Ver mis parejas sugeridas', 'See my suggested matches')}</Link>
        </motion.div>
      )}

      <ol className="mt-4 space-y-3">
        {steps.map((s) => {
          const done = step > s.n
          const current = step === s.n
          const locked = step < s.n
          const isOpen = open === s.n
          return (
            <li key={s.n} className={cn('card overflow-hidden', current && 'border-accent/50 ring-2 ring-accent-ring')}>
              <button className="flex w-full items-center gap-3 p-4 text-left" onClick={() => (locked ? toast(tr('Completá el paso anterior', 'Complete the previous step')) : setOpen(isOpen ? 0 : s.n))}>
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', done ? 'bg-green-600 text-white' : current ? 'bg-accent text-white' : 'bg-surface-2 text-muted')}>
                  {done ? <Check className="h-4 w-4" /> : locked ? <Lock className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </span>
                <div className="flex-1">
                  <p className="label-xs">{tr('Paso', 'Step')} {s.n}</p>
                  <p className={cn('font-semibold', locked && 'text-muted')}>{s.title}</p>
                </div>
                {locked ? <span className="text-xs text-muted">{tr('Completá el paso anterior', 'Complete the previous step')}</span> : <ChevronDown className={cn('h-4 w-4 text-muted transition-transform', isOpen && 'rotate-180')} />}
              </button>
              {isOpen && !locked && (
                <div className="border-t border-border px-4 pb-4 pt-3 sm:pl-16">
                  {s.n === 1 && (
                    <>
                      <p className="text-sm text-muted">{tr('Tu cuenta está activa y tu email fue verificado.', 'Your account is active and your email is verified.')}</p>
                      <DevNotice compact className="mt-2" title={tr('Verificación de email', 'Email verification')} now={tr('Ahora la verificación está simulada.', 'Verification is simulated for now.')} later={tr('Al desarrollar, se envía un link real de verificación.', 'Once built, a real verification link is sent.')} />
                    </>
                  )}
                  {s.n === 2 &&
                    (done ? (
                      <p className="text-sm">{tr('Membresía pagada', 'Membership paid')} · <span className="num">{fmtUSD(membershipPrice, lang)}</span> · <Link to="/mi/pagos" className="font-semibold text-accent hover:underline">{tr('Ver recibo', 'View receipt')}</Link></p>
                    ) : (
                      <>
                        <p className="text-sm text-muted">{tr('La membresía incluye tu entrevista psicológica y el acceso a presentaciones. Si no sos aprobado, te devolvemos el 100%.', 'The membership includes your psychological interview and access to introductions. If you aren’t approved, we refund 100%.')}</p>
                        <button className="btn-primary mt-3" onClick={pay}><CreditCard className="h-4 w-4" /> {tr(`Pagar ${fmtUSD(membershipPrice, lang)}`, `Pay ${fmtUSD(membershipPrice, lang)}`)}</button>
                        <DevNotice compact className="mt-3" title={tr('Cobro con Stripe', 'Stripe payments')} now={tr('Ahora simulamos el pago aprobado.', 'We now simulate the payment as approved.')} later={tr('Al desarrollar, el cobro se procesa de verdad y desbloquea el acceso automáticamente.', 'Once built, the charge is processed for real and unlocks access automatically.')} />
                      </>
                    ))}
                  {s.n === 3 && (
                    <>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="chip bg-accent-soft text-accent">{tr('Perfil', 'Profile')} <span className="num">{me.completitud}%</span></span>
                        <span className="chip border border-border"><Camera className="h-3 w-3" /> {me.fotos.length} {tr('fotos', 'photos')} {me.fotos.length > 0 && '✓'}</span>
                        <span className="chip border border-border"><Music className="h-3 w-3" /> {me.canciones.length} {tr('canciones', 'songs')} {me.canciones.length > 0 && '✓'}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link to="/mi/perfil" className="btn-outline btn-sm">{tr('Ir a mi perfil', 'Go to my profile')}</Link>
                        {current && <button className="btn-primary btn-sm" onClick={() => { updateMember(me.id, { completitud: Math.max(me.completitud, 80), estado: 'pendiente' }); setOnboardingStep(4) }}>{tr('Terminé mi perfil', 'I finished my profile')}</button>}
                      </div>
                    </>
                  )}
                  {s.n === 4 && (
                    <>
                      <p className="text-sm text-muted">{tr('Elegí un horario para tu entrevista por videollamada. Te respondemos dentro de las 48 h.', 'Pick a time for your video interview. We’ll answer within 48h.')}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {freeSlots().map((f) => (
                          <button key={f} onClick={() => setSlot(f)} className={cn('rounded-lg border px-2 py-2 text-left text-xs capitalize sm:text-sm', slot === f ? 'border-accent bg-accent-soft text-accent' : 'border-border hover:border-accent/50')}>
                            {format(new Date(f), 'EEE d · HH:mm', { locale: dateLocale(lang) })}
                          </button>
                        ))}
                      </div>
                      <button className="btn-primary mt-3" disabled={!slot} onClick={confirmSlot}>{myIv ? tr('Confirmar turno', 'Confirm appointment') : tr('Pedir turno', 'Book appointment')}</button>
                      {myIv && <p className="mt-2 text-xs text-muted">{tr('Turno actual', 'Current appointment')}: <span className="capitalize">{format(new Date(myIv.fecha), "EEEE d MMM · HH:mm", { locale: dateLocale(lang) })}</span></p>}
                    </>
                  )}
                  {s.n === 5 && (
                    <>
                      <p className="text-sm text-muted">
                        {step >= 6
                          ? tr('Aprobado por tu psicóloga. ¡Bienvenido a la agencia!', 'Approved by your psychologist. Welcome to the agency!')
                          : tr('Tu psicóloga está revisando tu entrevista. Si no sos aprobado, te explicamos el motivo y te devolvemos la membresía.', 'Your psychologist is reviewing your interview. If you aren’t approved, we explain why and refund your membership.')}
                      </p>
                    </>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {step >= 4 && step < 6 && (
        <div className="mt-4 text-center">
          <button className="btn-accent-outline" onClick={simulateApproval} data-trailer="onboarding-next">
            <Sparkles className="h-4 w-4" /> {tr('Ver cómo sigue', 'See what happens next')}
          </button>
        </div>
      )}
    </div>
  )
}
