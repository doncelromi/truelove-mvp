import { format } from 'date-fns'
import { toast } from 'sonner'
import { BellRing, CheckCircle2, CreditCard, HeartHandshake, Moon, UserCheck, XCircle } from 'lucide-react'
import { DevNotice, PreviewBanner } from '@/components/Notices'
import { Badge, CardHeader, PageHeader, Switch } from '@/components/ui'
import { CANALES, tx } from '@/data/catalog'
import type { Canal } from '@/data/types'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const ICONS: Record<string, typeof BellRing> = { a1: BellRing, a2: CreditCard, a3: HeartHandshake, a4: Moon, a5: UserCheck }

export default function Automatizaciones() {
  const tr = useTr()
  const { lang } = useLang()
  const { automations, setAutomations, automationLogs, addAudit } = useStore()

  const toggle = (id: string, v: boolean) => {
    const a = automations.find((x) => x.id === id)!
    setAutomations((l) => l.map((x) => (x.id === id ? { ...x, activo: v } : x)))
    addAudit('Viviana', 'config', v
      ? { es: `Reactivó la automatización “${a.nombre.es}”`, en: `Reactivated the “${a.nombre.en}” automation` }
      : { es: `Silenció la automatización “${a.nombre.es}”`, en: `Muted the “${a.nombre.en}” automation` })
    toast(v ? tr(`“${a.nombre.es}” reactivada`, `“${a.nombre.en}” reactivated`) : tr(`“${a.nombre.es}” silenciada`, `“${a.nombre.en}” muted`))
  }
  const setCanal = (id: string, canal: Canal) => {
    setAutomations((l) => l.map((x) => (x.id === id ? { ...x, canal } : x)))
    toast.success(tr(`Canal actualizado: ${CANALES[canal].es}`, `Channel updated: ${CANALES[canal].en}`))
  }

  return (
    <div>
      <PageHeader title={tr('Automatizaciones', 'Automations')} subtitle={tr('Avisos automáticos por email y SMS en cada momento clave del proceso.', 'Automatic email and SMS notices at every key moment of the process.')} />
      <PreviewBanner
        id="admin-automatizaciones"
        bullets={[
          tr('Recordatorios, confirmaciones y avisos sin intervención manual.', 'Reminders, confirmations and notices with no manual work.'),
          tr('Canal configurable por trigger: email, SMS o ambos.', 'Configurable channel per trigger: email, SMS or both.'),
          tr('Log completo de actividad; silenciás o reactivás en un clic.', 'Full activity log; mute or reactivate in one click.'),
        ]}
      />
      <DevNotice
        className="mb-4"
        title={tr('Envíos de email/SMS', 'Email/SMS delivery')}
        now={tr('Ahora los envíos se registran en el log de la demo.', 'Sends are now logged in the demo log.')}
        later={tr('Al desarrollar, cada trigger envía emails y SMS reales a candidatos y psicólogas.', 'Once built, each trigger sends real emails and SMS to candidates and psychologists.')}
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {automations.map((a) => {
          const Icon = ICONS[a.id] ?? BellRing
          return (
            <div key={a.id} className={cn('card flex flex-col p-5 transition-opacity', !a.activo && 'opacity-75')}>
              <div className="flex items-start justify-between gap-3">
                <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', a.activo ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-muted')}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{a.activo ? tr('Activa', 'Active') : tr('Silenciada', 'Muted')}</span>
                  <Switch checked={a.activo} onCheckedChange={(v) => toggle(a.id, v)} label={a.nombre[lang]} />
                </div>
              </div>
              <p className="mt-3 font-semibold">{a.nombre[lang]}</p>
              <p className="mt-1 flex-1 text-sm text-muted">{a.descripcion[lang]}</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="inline-flex rounded-lg border border-border p-0.5 text-xs">
                  {(['email', 'sms', 'ambos'] as Canal[]).map((c) => (
                    <button key={c} onClick={() => setCanal(a.id, c)} className={cn('h-7 rounded-md px-2 font-medium', a.canal === c ? 'bg-accent text-white' : 'text-muted hover:text-fg')}>
                      {tx(CANALES, c, lang)}
                    </button>
                  ))}
                </div>
                <p className="text-right text-xs text-muted"><span className="num text-base text-fg">{a.enviosMes}</span> {tr('este mes', 'this month')}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card mt-4">
        <CardHeader title={tr('Log de actividad', 'Activity log')} subtitle={tr('Últimos envíos automáticos', 'Latest automatic sends')} />
        <ul className="divide-y divide-border">
          {automationLogs.map((l) => {
            const a = automations.find((x) => x.id === l.automationId)!
            return (
              <li key={l.id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                {l.ok ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" /> : <XCircle className="h-4 w-4 shrink-0 text-red-600" />}
                <span className="min-w-0 flex-1 truncate">{l.detalle[lang]}</span>
                <Badge className="hidden sm:inline-flex">{a.nombre[lang]}</Badge>
                <span className="hidden w-24 text-xs text-muted md:inline">{tx(CANALES, l.canal, lang)}</span>
                <span className="num w-28 shrink-0 text-right text-xs text-muted">{format(new Date(l.fecha), 'd MMM · HH:mm', { locale: dateLocale(lang) })}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
