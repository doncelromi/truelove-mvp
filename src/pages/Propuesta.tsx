import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Check, Eye, EyeOff, FileText, MessageCircle, Printer, RotateCw, ShieldCheck, Timer, Rocket } from 'lucide-react'
import { RingsIcon } from '@/components/Logo'
import { useLang, useTr } from '@/lib/i18n'
import { useGo } from '@/lib/session'
import { cn, WHATSAPP_URL } from '@/lib/utils'

type Mod = { n: string; name: [string, string]; desc: [string, string]; bullets: [string, string][]; route: string }

const MODULES: Mod[] = [
  { n: '01', name: ['CRM multiusuario', 'Multi-user CRM'], desc: ['Vos, tus psicólogas y cada candidato entran con su propio usuario y ven solo lo suyo.', 'You, your psychologists and each candidate log in with their own user and see only what’s theirs.'], bullets: [['3 roles con permisos propios', '3 roles with their own permissions'], ['Un panel distinto por rol', 'A different dashboard per role'], ['Auditoría de cambios', 'Change audit log'], ['Acceso seguro con recuperación', 'Secure access with recovery']], route: '/admin/roles' },
  { n: '02', name: ['Panel de control', 'Control panel'], desc: ['Cómo viene la agencia de un vistazo, sin planillas.', 'How the agency is doing at a glance, no spreadsheets.'], bullets: [['Usuarios por estado', 'Members by status'], ['Ingresos y membresías activas', 'Revenue and active memberships'], ['Métricas de matches y conversión', 'Match and conversion metrics'], ['Exportación de reportes', 'Report export']], route: '/admin/panel' },
  { n: '03', name: ['Calendario de entrevistas', 'Interview calendar'], desc: ['Los candidatos piden turno solos y tus psicólogas llegan con todo preparado.', 'Candidates book on their own and your psychologists arrive fully prepared.'], bullets: [['Vista mensual y semanal', 'Monthly and weekly view'], ['Turnos pedidos por el candidato', 'Candidate-booked appointments'], ['Recordatorio 24h antes', '24h reminder'], ['Notas y resultado de la entrevista', 'Interview notes and outcome']], route: '/psico/agenda' },
  { n: '04', name: ['Motor de matches', 'Match engine'], desc: ['Vos decidís qué pesa más; el motor calcula y ordena las parejas.', 'You decide what matters most; the engine calculates and ranks couples.'], bullets: [['Pesos configurables sin código', 'Weights configurable with no code'], ['Score 0-100 por pareja', '0–100 score per couple'], ['Filtros de exclusión', 'Exclusion filters'], ['Recalibración en tiempo real', 'Real-time recalibration']], route: '/admin/matches' },
  { n: '05', name: ['Perfiles con fotos y música', 'Profiles with photos & music'], desc: ['Cada candidato arma su perfil completo, con sus fotos y las canciones que lo representan.', 'Each candidate builds a full profile, with their photos and the songs that represent them.'], bullets: [['Cada usuario crea su cuenta', 'Each member creates their account'], ['Sube sus fotos, elige portada y ordena', 'Uploads photos, picks a cover and sorts'], ['Canciones que lo representan', 'Songs that represent them'], ['Valores, fe, hijos y cuestionario psicológico', 'Values, faith, children and psychological questionnaire']], route: '/mi/perfil?tab=fotos' },
  { n: '06', name: ['Automatizaciones', 'Automations'], desc: ['Los avisos salen solos, en el momento justo.', 'Notices go out on their own, at the right moment.'], bullets: [['Recordatorios de entrevista', 'Interview reminders'], ['Confirmación de pago', 'Payment confirmation'], ['Aviso de nuevo match', 'New match notice'], ['Alertas a psicólogas', 'Psychologist alerts']], route: '/admin/automatizaciones' },
  { n: '07', name: ['Procesador de pagos', 'Payment processing'], desc: ['Cobrás la membresía online y el acceso se habilita solo.', 'Charge the membership online and access unlocks automatically.'], bullets: [['Cobro de membresía en el onboarding', 'Membership charged during onboarding'], ['Recibo PDF', 'PDF receipt'], ['Acceso bloqueado hasta pagar', 'Access blocked until paid'], ['Reembolso si es rechazado', 'Refund if rejected']], route: '/admin/pagos' },
  { n: '08', name: ['Onboarding completo', 'Complete onboarding'], desc: ['El candidato avanza solo, paso a paso, y retoma cuando quiere.', 'Candidates move forward on their own, step by step, and resume anytime.'], bullets: [['5 pasos guiados', '5 guided steps'], ['Barra de progreso', 'Progress bar'], ['No se saltean pasos', 'No skipping steps'], ['Retoma donde quedó', 'Resumes where they left off']], route: '/mi/onboarding' },
  { n: '09', name: ['Motor avanzado', 'Advanced engine'], desc: ['La compatibilidad que importa para un matrimonio, explicada.', 'The compatibility that matters for a marriage, explained.'], bullets: [['Compatibilidad emocional por cuestionario', 'Emotional compatibility via questionnaire'], ['Notas de la psicóloga en el score', 'Psychologist notes in the score'], ['Aprende de los rechazos', 'Learns from rejections'], ['Desglose explicado de cada score', 'Explained breakdown of every score']], route: '/admin/matches?detalle=top' },
]

export default function Propuesta() {
  const tr = useTr()
  const { lang } = useLang()
  const go = useGo()
  const [revealed, setRevealed] = useState(false) // sin persistencia: cada recarga arranca oculto
  const L = (p: [string, string]) => (lang === 'es' ? p[0] : p[1])

  const circuit = [
    { t: tr('Cuenta y membresía', 'Account & membership'), d: tr('El candidato crea su cuenta y paga online.', 'The candidate creates an account and pays online.') },
    { t: tr('Perfil completo', 'Complete profile'), d: tr('Sube sus fotos, elige las canciones que lo representan y completa su cuestionario.', 'Uploads photos, picks the songs that represent them and completes the questionnaire.') },
    { t: tr('Entrevista y aprobación', 'Interview & approval'), d: tr('Una psicóloga lo entrevista; vos aprobás o rechazás (con reembolso automático).', 'A psychologist interviews them; you approve or reject (with automatic refund).') },
    { t: tr('Motor de compatibilidad', 'Compatibility engine'), d: tr('Cruza valores, fe, intención de casarse, hijos, gustos y la evaluación de la psicóloga, y explica cada score.', 'Crosses values, faith, marriage intent, children, tastes and the psychologist’s evaluation, and explains each score.'), hl: true },
    { t: tr('Presentación y seguimiento', 'Introduction & follow-up'), d: tr('La pareja sugerida recibe el aviso y la agencia acompaña.', 'The suggested couple is notified and the agency supports them.') },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      {/* 1) ENCABEZADO */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <span className="chip bg-accent text-[10.5px] font-bold tracking-wider text-white"><FileText className="h-3 w-3" /> {tr('PROPUESTA COMERCIAL', 'COMMERCIAL PROPOSAL')}</span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-[40px] sm:leading-[1.1]">
            {tr('Propuesta para', 'Proposal for')} <span className="text-accent">Agencia True Love</span>
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted sm:text-base">
            {tr(
              'Tu plataforma completa para gestionar candidatos, entrevistas psicológicas y presentaciones con fines matrimoniales: CRM de 3 roles, perfiles con fotos y música, motor de compatibilidad avanzado, pagos y onboarding automatizado. Todo en una sola entrega.',
              'Your complete platform to manage candidates, psychological interviews and marriage-minded introductions: 3-role CRM, profiles with photos and music, advanced compatibility engine, payments and automated onboarding. All in a single delivery.',
            )}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="chip border border-border py-1"><Rocket className="h-3.5 w-3.5 text-accent" /> {tr('Prototipo funcional en 3 semanas', 'Working prototype in 3 weeks')}</span>
            <span className="chip border border-border py-1"><Timer className="h-3.5 w-3.5 text-accent" /> {tr('Entrega completa en 2,5 meses', 'Full delivery in 2.5 months')}</span>
            <span className="chip border border-border py-1"><ShieldCheck className="h-3.5 w-3.5 text-accent" /> {tr('Garantía 100%', '100% guarantee')}</span>
          </div>
        </div>
        <div className="no-print flex shrink-0 gap-2">
          <button className="btn-outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> {tr('Imprimir', 'Print')}</button>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn-primary"><MessageCircle className="h-4 w-4" /> {tr('Avanzar por WhatsApp', 'Move forward on WhatsApp')}</a>
        </div>
      </header>

      {/* 2) EL CIRCUITO */}
      <section className="mt-12" data-trailer="circuit">
        <p className="label-xs !text-accent">{tr('Cómo funciona', 'How it works')}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">{tr('El circuito', 'The journey')}</h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-5">
          {circuit.map((c, i) => (
            <div key={i} className={cn('card relative p-4', c.hl && 'border-accent bg-accent-soft ring-1 ring-accent/30')}>
              <p className={cn('label-xs', c.hl && '!text-accent')}>{tr('PASO', 'STEP')} {i + 1}</p>
              <p className="mt-1.5 font-semibold leading-snug">{c.t}</p>
              <p className="mt-1.5 text-sm text-muted">{c.d}</p>
              {c.hl && <RingsIcon className="absolute right-3 top-3 h-4 w-5" />}
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-muted"><RotateCw className="h-3.5 w-3.5" /> {tr('Y vuelve a empezar: cada entrevista y cada presentación afinan la próxima.', 'And it starts again: every interview and every introduction fine-tunes the next.')}</p>
      </section>

      {/* 3) QUÉ INCLUYE */}
      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="label-xs !text-accent">{tr('Alcance', 'Scope')}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">{tr('Qué incluye la plataforma', 'What the platform includes')}</h2>
          </div>
          <span className="chip bg-accent-soft py-1 text-accent"><span className="num">9</span> {tr('módulos · una sola entrega', 'modules · a single delivery')}</span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <article key={m.n} className="card flex flex-col p-5">
              <p className="num text-sm text-accent">{m.n}</p>
              <h3 className="mt-1 text-sm font-semibold uppercase tracking-wide">{L(m.name)}</h3>
              <p className="mt-2 text-sm text-muted">{L(m.desc)}</p>
              <ul className="mt-3 flex-1 space-y-1.5 text-sm">
                {m.bullets.map((b) => (
                  <li key={b[0]} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{L(b)}</li>
                ))}
              </ul>
              <button className="no-print mt-4 inline-flex items-center gap-1 self-start text-sm font-semibold text-accent hover:underline" onClick={() => go(m.route)}>
                {tr('Ver en el demo', 'See it in the demo')} <ArrowUpRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* 4) INVERSIÓN — siempre al final */}
      <section className="mt-12" data-tour="investment">
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
            <div>
              <p className="label-xs">{tr('Inversión', 'Investment')}</p>
              {!revealed && <p className="num mt-1 text-2xl tracking-widest text-muted">USD ••••••</p>}
              {revealed && <p className="mt-1 text-sm text-muted">{tr('Detalle completo abajo', 'Full details below')}</p>}
            </div>
            <button className={cn('btn h-11 px-5', revealed ? 'btn-outline' : 'btn-primary')} onClick={() => setRevealed((v) => !v)} aria-expanded={revealed}>
              {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {revealed ? tr('Ocultar inversión', 'Hide investment') : tr('Ver inversión', 'View investment')}
            </button>
          </div>
          <AnimatePresence initial={false}>
            {revealed && (
              <motion.div
                key="inv"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border p-5 sm:p-6">
                  <p className="label-xs">{tr('Inversión total · Plataforma completa, una sola entrega', 'Total investment · Complete platform, single delivery')}</p>
                  <p className="num mt-2 text-[44px] font-bold leading-none tracking-tight sm:text-[56px]">USD {lang === 'es' ? '5.000' : '5,000'}</p>
                  <p className="mt-3 max-w-2xl text-sm text-muted">
                    {tr('Incluye los 9 módulos, relevamiento inicial, entrega completa en 2,5 meses y 1 mes de soporte post-entrega.', 'Includes all 9 modules, initial discovery, full delivery in 2.5 months and 1 month of post-delivery support.')}
                  </p>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between"><p className="label-xs">{tr('Pago 1 · al firmar', 'Payment 1 · on signing')}</p><span className="num text-sm text-muted">50%</span></div>
                      <p className="num mt-1 text-2xl">USD {lang === 'es' ? '2.500' : '2,500'}</p>
                      <p className="mt-1 text-sm text-muted">{tr('Arrancamos el relevamiento y el desarrollo.', 'We start discovery and development.')}</p>
                    </div>
                    <div className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between"><p className="label-xs">{tr('Pago 2 · a los 30 días', 'Payment 2 · after 30 days')}</p><span className="num text-sm text-muted">50%</span></div>
                      <p className="num mt-1 text-2xl">USD {lang === 'es' ? '2.500' : '2,500'}</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border-2 border-accent bg-accent-soft p-4">
                    <p className="font-semibold">{tr('Pagando el 100% por adelantado: 15% de descuento', 'Paying 100% upfront: 15% discount')}</p>
                    <div className="mt-2 flex flex-wrap items-baseline gap-3">
                      <span className="num text-lg text-muted line-through">USD {lang === 'es' ? '5.000' : '5,000'}</span>
                      <span className="num text-3xl font-bold text-accent">USD {lang === 'es' ? '4.250' : '4,250'}</span>
                      <span className="chip bg-accent text-white">{tr('ahorrás', 'you save')} USD 750</span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-3 rounded-xl bg-surface-2 p-4 text-sm">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-green-600" />
                    <p><b>{tr('Garantía', 'Guarantee')}:</b> {tr('Si el primer prototipo (semana 3) no cumple lo acordado, te devolvemos el 100%.', 'If the first prototype (week 3) doesn’t meet what we agreed, we refund 100%.')}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 5) CIERRE */}
      <section className="mt-10 text-center">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn-primary h-12 w-full text-base">
          <MessageCircle className="h-5 w-5" /> {tr('Avanzar por WhatsApp', 'Move forward on WhatsApp')}
        </a>
        <p className="mt-3 text-[10px] text-muted">Powered by Insights</p>
      </section>
    </div>
  )
}
