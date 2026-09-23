import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { BrainCircuit, Gauge, LogIn, MessageCircle, Music2, PlayCircle, Route as RouteIcon } from 'lucide-react'
import { Logo, RingsIcon } from '@/components/Logo'
import { DemoPill, LangToggle, ThemeToggle } from '@/components/Toggles'
import type { Role } from '@/data/types'
import { useTr } from '@/lib/i18n'
import { useSession } from '@/lib/session'
import { WHATSAPP_URL } from '@/lib/utils'

const ACCOUNTS: { role: Role; label: [string, string]; email: string }[] = [
  { role: 'admin', label: ['Viviana · Administradora', 'Viviana · Administrator'], email: 'viviana@truelove.demo' },
  { role: 'psico', label: ['Lic. Carolina · Psicóloga', 'Lic. Carolina · Psychologist'], email: 'carolina@truelove.demo' },
  { role: 'user', label: ['Martín · Usuario', 'Martín · Member'], email: 'martin@truelove.demo' },
]

export default function Login() {
  const tr = useTr()
  const navigate = useNavigate()
  const { login } = useSession()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [remember, setRemember] = useState(true)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const acc = ACCOUNTS.find((a) => a.email === email.trim().toLowerCase() && pass === 'demo2026')
    login(acc?.role ?? 'admin')
    navigate('/propuesta')
  }

  const features = [
    { icon: BrainCircuit, text: tr('Entrevista psicológica a cada candidato.', 'A psychological interview for every candidate.') },
    { icon: Gauge, text: tr('Motor de compatibilidad con score 0-100 explicado.', 'Compatibility engine with an explained 0–100 score.') },
    { icon: Music2, text: tr('Perfiles completos con fotos y la música de cada uno.', 'Complete profiles with photos and each person’s music.') },
    { icon: RouteIcon, text: tr('Onboarding guiado: registro, pago, entrevista y aprobación.', 'Guided onboarding: sign-up, payment, interview and approval.') },
  ]

  return (
    <div className="relative min-h-screen bg-bg lg:grid lg:grid-cols-[55%_45%]">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <LangToggle />
        <ThemeToggle />
      </div>

      {/* Panel hero */}
      <aside className="relative hidden overflow-hidden border-r border-border lg:flex lg:flex-col lg:justify-center lg:px-16 xl:px-24">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#FDF2F5] dark:from-[#09090b] dark:via-[#0d0b0c] dark:to-[#1a0c12]" />
        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-accent/[.12] blur-3xl" />
        <div className="absolute -bottom-10 right-10 h-72 w-72 rounded-full bg-accent/[.12] blur-3xl" />
        <div className="relative max-w-xl">
          <div className="flex items-center gap-3">
            <Logo />
            <DemoPill />
          </div>
          <h1 className="mt-10 text-5xl font-extrabold leading-[1.05] tracking-tight xl:text-6xl">
            {tr('Relaciones serias.', 'Serious relationships.')}
            <br />
            <span className="text-accent">{tr('Con destino al altar.', 'Headed for the altar.')}</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            {tr(
              'Perfiles validados por psicólogos, matches por compatibilidad real y un proceso confidencial para quienes buscan casarse.',
              'Profiles validated by psychologists, matches based on real compatibility and a confidential process for people who want to get married.',
            )}
          </p>
          <ul className="mt-9 space-y-3.5">
            {features.map((f, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.35 }}
                className="flex items-center gap-3.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <f.icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-[15px] font-medium">{f.text}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Card de login */}
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-8">
        <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
          <Logo />
          <DemoPill />
        </div>
        <div className="card w-full max-w-[420px] p-7 sm:p-8">
          <div className="mb-1 flex items-center gap-2">
            <RingsIcon className="h-4 w-5" />
            <span className="label-xs">Agencia True Love</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{tr('Ingresá a True Love', 'Sign in to True Love')}</h2>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">{tr('Usuario', 'Username')}</span>
              <input className="input" type="email" autoComplete="off" placeholder={tr('tu@email.com', 'you@email.com')} value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">{tr('Contraseña', 'Password')}</span>
              <input className="input" type="password" autoComplete="off" placeholder="••••••••" value={pass} onChange={(e) => setPass(e.target.value)} />
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-muted">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
                {tr('Recordarme', 'Remember me')}
              </label>
              <button
                type="button"
                className="font-medium text-accent hover:underline"
                onClick={() => toast(tr('Te enviamos un link para recuperar tu contraseña (demo).', 'We sent you a password reset link (demo).'))}
              >
                {tr('¿Olvidaste tu contraseña?', 'Forgot your password?')}
              </button>
            </div>
            <button type="submit" className="btn-primary h-11 w-full text-[15px]">
              <LogIn className="h-4 w-4" />
              {tr('Ingresar', 'Sign in')}
            </button>
          </form>

          <div className="mt-6">
            <p className="label-xs mb-2">{tr('Cuentas demo · autocompletar', 'Demo accounts · autofill')}</p>
            <div className="flex flex-wrap gap-2">
              {ACCOUNTS.map((a) => (
                <button
                  key={a.role}
                  type="button"
                  onClick={() => {
                    setEmail(a.email)
                    setPass('demo2026')
                  }}
                  className={`chip border py-1 transition-colors ${email === a.email ? 'border-accent bg-accent-soft text-accent' : 'border-border text-fg hover:border-accent/50'}`}
                >
                  {tr(a.label[0], a.label[1])}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            {tr('¿Todavía no sos miembro?', 'Not a member yet?')}{' '}
            <Link to="/registro" className="font-semibold text-accent hover:underline">
              {tr('Creá tu cuenta', 'Create your account')}
            </Link>
          </p>

          <div className="my-5 h-px bg-border" />
          <Link to="/trailer" className="btn-outline h-10 w-full">
            <PlayCircle className="h-4 w-4 text-accent" />
            {tr('Ver demo automática de la plataforma', 'Watch the automatic platform demo')}
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted hover:text-accent">
            <MessageCircle className="h-4 w-4" />
            {tr('¿No tenés acceso? Hablemos por WhatsApp', 'No access? Let’s talk on WhatsApp')}
          </a>
        </div>
        <p className="mt-6 text-[10px] text-muted">Powered by Insights</p>
      </main>
    </div>
  )
}
