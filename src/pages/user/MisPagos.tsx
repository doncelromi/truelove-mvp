import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { BadgeCheck, FileDown, ShieldCheck } from 'lucide-react'
import { DevNotice, PreviewBanner } from '@/components/Notices'
import { Empty, PageHeader, TxBadge } from '@/components/ui'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import { fmtUSD } from '@/lib/utils'

export default function MisPagos() {
  const tr = useTr()
  const { lang } = useLang()
  const { currentUserId, byId, transactions } = useStore()
  const me = byId(currentUserId)!
  const mine = transactions.filter((t) => t.memberId === me.id)
  const [clicked, setClicked] = useState(false)
  const paid = me.pago === 'ok'

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={tr('Tus pagos', 'Your payments')} subtitle={tr('Tu membresía y tus recibos, siempre a mano.', 'Your membership and receipts, always at hand.')} />
      <PreviewBanner
        id="user-pagos"
        bullets={[
          tr('Pagás una sola vez dentro del onboarding.', 'You pay once during onboarding.'),
          tr('Recibo PDF automático en tu email.', 'Automatic PDF receipt to your email.'),
          tr('Reintegro del 100% si tu perfil no es aprobado.', '100% refund if your profile isn’t approved.'),
        ]}
      />
      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent"><BadgeCheck className="h-6 w-6" /></span>
        <div className="flex-1">
          <p className="label-xs">{tr('Membresía True Love', 'True Love Membership')}</p>
          <p className="mt-0.5 text-xl font-bold">{paid ? tr('Activa', 'Active') : tr('Pendiente de pago', 'Payment pending')}</p>
          <p className="text-sm text-muted">{tr('Incluye entrevista psicológica y presentaciones por compatibilidad.', 'Includes psychological interview and compatibility-based introductions.')}</p>
        </div>
        {!paid && <Link to="/mi/onboarding" className="btn-primary">{tr('Pagar ahora', 'Pay now')}</Link>}
      </div>
      <div className="mt-3 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        {tr('Si tu perfil no es aprobado, te reintegramos el 100% de la membresía.', 'If your profile isn’t approved, we refund 100% of the membership.')}
      </div>
      <div className="card mt-4">
        {mine.length === 0 ? (
          <Empty text={tr('Todavía no hay pagos.', 'No payments yet.')} />
        ) : (
          <ul className="divide-y divide-border">
            {mine.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{tr('Membresía True Love', 'True Love Membership')}</p>
                  <p className="text-xs text-muted"><span className="num">{t.id}</span> · {format(new Date(t.fecha), 'd MMM yyyy', { locale: dateLocale(lang) })}</p>
                </div>
                <span className="num">{fmtUSD(t.monto, lang)}</span>
                <TxBadge estado={t.estado} />
                <button className="btn-outline btn-sm" onClick={() => { setClicked(true); toast.success(tr('Recibo descargado (demo)', 'Receipt downloaded (demo)')) }}>
                  <FileDown className="h-3.5 w-3.5" /> {tr('Recibo', 'Receipt')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {clicked && (
        <DevNotice
          className="mt-3"
          title={tr('Recibo PDF', 'PDF receipt')}
          now={tr('Ahora la descarga está simulada.', 'The download is simulated for now.')}
          later={tr('Al desarrollar, se genera el PDF real y también llega por email.', 'Once built, the real PDF is generated and also emailed.')}
        />
      )}
    </div>
  )
}
