import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, MailCheck, UserPlus } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { DevNotice } from '@/components/Notices'
import { DemoPill, LangToggle, ThemeToggle } from '@/components/Toggles'
import { CIUDADES } from '@/data/catalog'
import { useTr } from '@/lib/i18n'
import { useSession } from '@/lib/session'
import { useStore } from '@/lib/store'
import { ssSet } from '@/lib/utils'

export default function Registro() {
  const tr = useTr()
  const navigate = useNavigate()
  const { login, setWelcomeDone } = useSession()
  const { createMember } = useStore()
  const [f, setF] = useState({ nombre: '', apellido: '', email: '', pass: '', nac: '1990-05-14', genero: 'F' as 'M' | 'F', ciudad: 'Palermo' })
  const [terms, setTerms] = useState(false)
  const [sent, setSent] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!f.nombre || !f.apellido || !f.email || !f.pass) {
      toast.error(tr('Completá nombre, apellido, email y contraseña.', 'Please fill in name, last name, email and password.'))
      return
    }
    if (!terms) {
      toast.error(tr('Necesitamos que aceptes los términos y la confidencialidad.', 'Please accept the terms and confidentiality policy.'))
      return
    }
    setSent(true)
  }

  const enter = () => {
    const edad = Math.max(28, new Date().getFullYear() - Number(f.nac.slice(0, 4)))
    createMember({ nombre: f.nombre, apellido: f.apellido, email: f.email, genero: f.genero, edad, ciudad: f.ciudad })
    login('user')
    // la cuenta recién creada salta la propuesta y el welcome: es el recorrido del candidato
    setWelcomeDone(true)
    ssSet('tl_tour_completed_user', true)
    toast.success(tr('Cuenta creada', 'Account created'))
    navigate('/mi/onboarding')
  }

  return (
    <div className="relative min-h-screen bg-bg bg-gradient-to-b from-transparent to-[#FDF2F5]/60 dark:to-transparent">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LangToggle />
        <ThemeToggle />
      </div>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-16">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <DemoPill />
        </div>
        <div className="card p-7">
          {!sent ? (
            <>
              <p className="label-xs">{tr('Paso 1 de 5 · Tu cuenta', 'Step 1 of 5 · Your account')}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">{tr('Creá tu cuenta en la agencia', 'Create your agency account')}</h1>
              <p className="mt-1 text-sm text-muted">
                {tr('Un proceso cuidado y confidencial, pensado para quienes buscan casarse.', 'A careful, confidential process for people who want to get married.')}
              </p>
              <form onSubmit={submit} className="mt-6 grid grid-cols-2 gap-3">
                <label className="col-span-1">
                  <span className="mb-1 block text-sm font-medium">{tr('Nombre', 'First name')}</span>
                  <input className="input" value={f.nombre} onChange={set('nombre')} />
                </label>
                <label className="col-span-1">
                  <span className="mb-1 block text-sm font-medium">{tr('Apellido', 'Last name')}</span>
                  <input className="input" value={f.apellido} onChange={set('apellido')} />
                </label>
                <label className="col-span-2">
                  <span className="mb-1 block text-sm font-medium">Email</span>
                  <input className="input" type="email" value={f.email} onChange={set('email')} placeholder={tr('tu@email.com', 'you@email.com')} />
                </label>
                <label className="col-span-2">
                  <span className="mb-1 block text-sm font-medium">{tr('Contraseña', 'Password')}</span>
                  <input className="input" type="password" value={f.pass} onChange={set('pass')} placeholder="••••••••" />
                </label>
                <label className="col-span-2 sm:col-span-1">
                  <span className="mb-1 block text-sm font-medium">{tr('Fecha de nacimiento', 'Date of birth')}</span>
                  <input className="input" type="date" value={f.nac} onChange={set('nac')} />
                </label>
                <label className="col-span-2 sm:col-span-1">
                  <span className="mb-1 block text-sm font-medium">{tr('Género', 'Gender')}</span>
                  <select className="input" value={f.genero} onChange={set('genero')}>
                    <option value="F">{tr('Mujer', 'Woman')}</option>
                    <option value="M">{tr('Hombre', 'Man')}</option>
                  </select>
                </label>
                <label className="col-span-2">
                  <span className="mb-1 block text-sm font-medium">{tr('Ciudad o barrio', 'City or neighborhood')}</span>
                  <select className="input" value={f.ciudad} onChange={set('ciudad')}>
                    {Object.keys(CIUDADES).map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="col-span-2 mt-1 flex cursor-pointer items-start gap-2 text-sm text-muted">
                  <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
                  {tr(
                    'Acepto los términos del servicio y el compromiso de confidencialidad de la agencia.',
                    'I accept the terms of service and the agency’s confidentiality commitment.',
                  )}
                </label>
                <button type="submit" className="btn-primary col-span-2 mt-2 h-11">
                  <UserPlus className="h-4 w-4" /> {tr('Crear mi cuenta', 'Create my account')}
                </button>
              </form>
            </>
          ) : (
            <div className="pop-in text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <MailCheck className="h-7 w-7" />
              </span>
              <h1 className="mt-4 text-2xl font-bold">{tr('Verificá tu email', 'Verify your email')}</h1>
              <p className="mt-1 text-sm text-muted">
                {tr('Te enviamos un link de verificación a', 'We sent a verification link to')} <b className="text-fg">{f.email}</b>
              </p>
              <DevNotice
                className="mt-5 text-left"
                title={tr('Verificación de email', 'Email verification')}
                now={tr('Ahora simulamos que el email ya fue verificado.', 'We now simulate the email as already verified.')}
                later={tr('Al desarrollar, se envía un link real y la cuenta se activa al hacer clic.', 'Once built, a real link is sent and the account activates on click.')}
              />
              <button onClick={enter} className="btn-primary mt-6 h-11 w-full">
                {tr('Ya verifiqué · Continuar a mi camino', 'I’ve verified · Continue to my journey')}
              </button>
            </div>
          )}
        </div>
        <Link to="/login" className="mt-5 inline-flex items-center justify-center gap-1.5 text-sm text-muted hover:text-accent">
          <ArrowLeft className="h-4 w-4" /> {tr('Ya tengo cuenta', 'I already have an account')}
        </Link>
      </div>
    </div>
  )
}
