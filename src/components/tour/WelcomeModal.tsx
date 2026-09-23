import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useTr } from '@/lib/i18n'
import { useSession } from '@/lib/session'
import { Logo } from '../Logo'

export default function WelcomeModal() {
  const tr = useTr()
  const { logged, welcomeDone, setWelcomeDone, trailer } = useSession()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!logged || welcomeDone || trailer) return
    const t = window.setTimeout(() => setShow(true), 400)
    return () => window.clearTimeout(t)
  }, [logged, welcomeDone, trailer])

  if (!show || welcomeDone) return null
  return (
    <div className="fixed inset-0 z-[95]" role="dialog" aria-modal aria-labelledby="tl-welcome-title">
      {/* no se cierra clickeando afuera */}
      <div className="fade-in absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <div className="modal-center pop-in w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-surface p-7 shadow-2xl sm:p-8">
        <Logo className="[&>span:last-child]:text-accent" />
        <h2 id="tl-welcome-title" className="mt-5 text-2xl font-bold tracking-tight">{tr('Hola Viviana 👋', 'Hi Viviana 👋')}</h2>
        <p className="mt-3 font-medium">
          {tr('Somos Juan y Fede de Insights. Construimos este MVP para que veas tu plataforma funcionando antes de invertir.', 'We’re Juan and Fede from Insights. We built this MVP so you can see your platform working before investing.')}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {tr(
            'Acá vas a ver cómo cada candidato crea su cuenta, paga su membresía, arma su perfil con sus fotos y las canciones que lo representan, y pasa por una entrevista con una de tus psicólogas antes de ser aprobado. Una vez adentro, el motor de compatibilidad cruza sus valores, su fe, su intención de casarse y lo que quiere sobre hijos con cada miembro, suma lo que anotó la psicóloga, y te propone las parejas con mejor score explicándote por qué.',
            'Here you’ll see how each candidate creates an account, pays the membership, builds a profile with their photos and the songs that represent them, and goes through an interview with one of your psychologists before being approved. Once in, the compatibility engine crosses their values, faith, marriage intent and wishes about children with every member, adds the psychologist’s notes, and proposes the couples with the best score, explaining why.',
          )}
        </p>
        <p className="mt-3 text-sm italic text-muted">
          {tr('Si te gusta lo que ves, hacé clic en “Quiero arrancar” y arrancamos.', 'If you like what you see, click “Let’s get started” and we’ll begin.')}
        </p>
        <button
          className="btn-primary mt-6 h-11 w-full text-[15px]"
          onClick={() => {
            setShow(false)
            setWelcomeDone(true)
          }}
          autoFocus
        >
          {tr('Ver la plataforma', 'See the platform')} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
