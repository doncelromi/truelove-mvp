import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, CalendarX2, CameraOff, Download, HeartHandshake, KeyRound, Send, Users, Video, Wallet } from 'lucide-react'
import { MemberPhoto } from '@/components/MemberPhoto'
import { DevNotice, PreviewBanner } from '@/components/Notices'
import { CardHeader, Kpi, Modal, PageHeader, PagoBadge, StatusBadge } from '@/components/ui'
import { MEMBERSHIP_SERIES } from '@/data/ops'
import { psicoById } from '@/data/members'
import { PROFESIONES } from '@/data/catalog'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { useGo } from '@/lib/session'
import { useStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'

const FUNNEL = [
  { es: 'Registrados', en: 'Signed up', v: 312 },
  { es: 'Pagaron', en: 'Paid', v: 268 },
  { es: 'Entrevistados', en: 'Interviewed', v: 241 },
  { es: 'Aprobados', en: 'Approved', v: 214 },
  { es: 'Con pareja sugerida', en: 'With a suggested match', v: 163 },
]

export default function Panel() {
  const tr = useTr()
  const { lang } = useLang()
  const go = useGo()
  const navigate = useNavigate()
  const { members, interviews } = useStore()
  const [exportOpen, setExportOpen] = useState(false)
  const [reminderSent, setReminderSent] = useState(false)

  const pendientes = members.filter((m) => m.estado === 'pendiente').slice(0, 5)
  const sinFotos = members.filter((m) => m.fotos.length === 0).length
  const canceladas = interviews.filter((i) => i.estado === 'cancelada').length
  const { theme } = useTheme()
  const accent = theme === 'dark' ? '#F0587F' : '#9F1D48'
  const grid = theme === 'dark' ? 'rgba(255,255,255,.07)' : '#e4e4e7'
  const series = MEMBERSHIP_SERIES.map((s) => ({ ...s, label: format(new Date(s.month), 'MMM', { locale: dateLocale(lang) }) }))

  return (
    <div>
      <PageHeader
        title={tr('Panel de control', 'Control panel')}
        subtitle={tr('Cómo viene la agencia hoy: miembros, entrevistas, presentaciones e ingresos.', 'How the agency is doing today: members, interviews, introductions and revenue.')}
        actions={
          <button className="btn-outline" onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4" /> {tr('Exportar reporte', 'Export report')}
          </button>
        }
      />
      <PreviewBanner
        id="admin-panel"
        bullets={[
          tr('Métricas en vivo de miembros, entrevistas, presentaciones e ingresos.', 'Live metrics for members, interviews, introductions and revenue.'),
          tr('Alertas accionables: pagos sin turno, cancelaciones, accesos fallidos.', 'Actionable alerts: paid without booking, cancellations, failed logins.'),
          tr('Reportes mensuales exportables para la dirección.', 'Exportable monthly reports for management.'),
        ]}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4" data-trailer="kpis">
        <Kpi label={tr('Miembros activos', 'Active members')} value="214" delta="+12" icon={<Users className="h-4 w-4" />} hint={tr('vs. mes anterior', 'vs. last month')} />
        <Kpi label={tr('Entrevistas esta semana', 'Interviews this week')} value="18" icon={<Video className="h-4 w-4" />} hint={tr(`${canceladas} canceladas`, `${canceladas} cancelled`)} />
        <Kpi label={tr('Parejas presentadas este mes', 'Couples introduced this month')} value="37" delta="+9" icon={<HeartHandshake className="h-4 w-4" />} hint={tr('vs. mes anterior', 'vs. last month')} />
        <Kpi label={tr('Ingresos del mes', 'Revenue this month')} value={lang === 'es' ? 'USD 11.520' : 'USD 11,520'} delta="+14%" icon={<Wallet className="h-4 w-4" />} hint={tr('24 membresías cobradas', '24 memberships charged')} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <CardHeader title={tr('Nuevas membresías — últimos 6 meses', 'New memberships — last 6 months')} subtitle={tr('Cobros aprobados por mes', 'Approved charges per month')} />
          <div className="h-64 px-2 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: -18, right: 12, top: 8 }}>
                <defs>
                  <linearGradient id="gMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                  formatter={(v: number) => [v, tr('Membresías', 'Memberships')]}
                />
                <Area type="monotone" dataKey="value" stroke={accent} strokeWidth={2.5} fill="url(#gMem)" dot={{ r: 3, fill: accent }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <CardHeader title={tr('Embudo de conversión', 'Conversion funnel')} subtitle={tr('Desde el registro hasta la pareja sugerida', 'From sign-up to suggested match')} />
          <div className="space-y-3 p-5">
            {FUNNEL.map((f, i) => (
              <div key={f.es}>
                <div className="flex items-center justify-between text-sm">
                  <span>{f[lang]}</span>
                  <span className="num">{f.v}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-surface-2">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${(f.v / FUNNEL[0].v) * 100}%`, opacity: 1 - i * 0.13 }} />
                </div>
                {i > 0 && (
                  <p className="mt-0.5 text-right text-[11px] text-muted">
                    <span className="num">{Math.round((f.v / FUNNEL[i - 1].v) * 100)}%</span> {tr('de la etapa anterior', 'of previous stage')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="card lg:col-span-2">
          <CardHeader title={tr('Alertas', 'Alerts')} subtitle={tr('Lo que requiere tu atención hoy', 'What needs your attention today')} right={<AlertTriangle className="h-4 w-4 text-amber-500" />} />
          <ul className="divide-y divide-border">
            <li className="p-4">
              <div className="flex items-start gap-3">
                <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{tr('Sofía Ledesma pagó hace 9 días y no pidió turno', 'Sofía Ledesma paid 9 days ago and hasn’t booked')}</p>
                  <button
                    className="btn-primary btn-sm mt-2"
                    onClick={() => {
                      setReminderSent(true)
                      toast.success(tr('Recordatorio enviado a Sofía Ledesma', 'Reminder sent to Sofía Ledesma'))
                    }}
                  >
                    <Send className="h-3.5 w-3.5" /> {reminderSent ? tr('Reenviar recordatorio', 'Resend reminder') : tr('Enviar recordatorio', 'Send reminder')}
                  </button>
                  {reminderSent && (
                    <DevNotice
                      compact
                      className="mt-2"
                      title={tr('Envío de email/SMS', 'Email/SMS delivery')}
                      now={tr('Ahora registramos el envío en la demo.', 'We now log the send in the demo.')}
                      later={tr('Al desarrollar, el recordatorio llega de verdad por email y SMS.', 'Once built, the reminder is actually delivered by email and SMS.')}
                    />
                  )}
                </div>
              </div>
            </li>
            <AlertRow icon={<CalendarX2 className="h-4 w-4 text-red-500" />} text={tr(`${canceladas} entrevistas canceladas esta semana`, `${canceladas} interviews cancelled this week`)} cta={tr('Ver calendario', 'View calendar')} onClick={() => go('/admin/calendario')} />
            <AlertRow icon={<KeyRound className="h-4 w-4 text-red-500" />} text={tr('5 intentos de login fallidos de una misma cuenta', '5 failed login attempts from the same account')} cta={tr('Ver auditoría', 'View audit log')} onClick={() => go('/admin/roles')} />
            <AlertRow icon={<CameraOff className="h-4 w-4 text-amber-500" />} text={tr(`${sinFotos} perfiles sin fotos cargadas`, `${sinFotos} profiles without photos`)} cta={tr('Ver perfiles', 'View profiles')} onClick={() => navigate('/admin/usuarios?tab=incompleto')} />
          </ul>
        </div>

        <div className="card lg:col-span-3">
          <CardHeader
            title={tr('Pendientes de validación', 'Pending validation')}
            subtitle={tr('Pagaron y esperan entrevista o decisión', 'Paid and awaiting interview or decision')}
            right={
              <button className="text-xs font-semibold text-accent hover:underline" onClick={() => navigate('/admin/usuarios?tab=pendiente')}>
                {tr('Ver todos', 'View all')}
              </button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="label-xs px-5 py-2.5">{tr('Miembro', 'Member')}</th>
                  <th className="label-xs hidden px-3 py-2.5 sm:table-cell">{tr('Psicóloga', 'Psychologist')}</th>
                  <th className="label-xs px-3 py-2.5">{tr('Pago', 'Payment')}</th>
                  <th className="label-xs px-3 py-2.5">{tr('Estado', 'Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendientes.map((m) => (
                  <tr key={m.id} className="cursor-pointer hover:bg-surface-2" onClick={() => navigate(`/admin/usuarios/${m.id}`)}>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <MemberPhoto member={m} size="sm" />
                        <div>
                          <p className="font-medium">{m.nombre} {m.apellido}</p>
                          <p className="text-xs text-muted">{PROFESIONES[m.profesion]?.[lang]} · {m.ciudad}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-2.5 text-muted sm:table-cell">{psicoById(m.psicologaId).nombre}</td>
                    <td className="px-3 py-2.5"><PagoBadge pago={m.pago} /></td>
                    <td className="px-3 py-2.5"><StatusBadge status={m.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat label={tr('Conversión registro → aprobado', 'Sign-up → approved conversion')} value="69%" />
        <MiniStat label={tr('Presentaciones aceptadas', 'Introductions accepted')} value="72%" />
        <MiniStat label={tr('Score promedio de presentaciones', 'Average introduction score')} value="86" />
        <MiniStat label={tr('Logins fallidos (7 días)', 'Failed logins (7 days)')} value="9" />
      </div>

      <Modal open={exportOpen} onOpenChange={setExportOpen} title={tr('Exportar reporte mensual', 'Export monthly report')}>
        <p className="text-sm text-muted">
          {tr('Incluye miembros por estado, entrevistas, presentaciones, conversión e ingresos del mes.', 'Includes members by status, interviews, introductions, conversion and monthly revenue.')}
        </p>
        <DevNotice
          className="mt-4"
          title={tr('Exportar reporte', 'Export report')}
          now={tr('Ahora simulamos la generación del archivo.', 'We now simulate generating the file.')}
          later={tr('Al desarrollar, se descarga un PDF/Excel con los datos reales.', 'Once built, a PDF/Excel with real data is downloaded.')}
        />
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-outline" onClick={() => setExportOpen(false)}>{tr('Cancelar', 'Cancel')}</button>
          <button
            className="btn-primary"
            onClick={() => {
              setExportOpen(false)
              toast.success(tr('Reporte generado (demo)', 'Report generated (demo)'))
            }}
          >
            <Download className="h-4 w-4" /> {tr('Generar', 'Generate')}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function AlertRow({ icon, text, cta, onClick }: { icon: React.ReactNode; text: string; cta: string; onClick: () => void }) {
  return (
    <li className="flex items-start gap-3 p-4">
      <span className="mt-0.5">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{text}</p>
        <button className="mt-1 text-xs font-semibold text-accent hover:underline" onClick={onClick}>
          {cta} →
        </button>
      </div>
    </li>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
      <p className="label-xs">{label}</p>
      <p className="num mt-1 text-xl">{value}</p>
    </div>
  )
}
