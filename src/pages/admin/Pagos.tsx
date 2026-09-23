import { useState } from 'react'
import { format, isSameMonth } from 'date-fns'
import { toast } from 'sonner'
import { AlertCircle, BadgeCheck, FileDown, RotateCcw, Wallet } from 'lucide-react'
import { MemberPhoto } from '@/components/MemberPhoto'
import { DevNotice, PreviewBanner } from '@/components/Notices'
import { CardHeader, Kpi, Modal, PageHeader, Tabs, TxBadge } from '@/components/ui'
import type { Transaction, TxEstado } from '@/data/types'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import { fmtUSD } from '@/lib/utils'

export default function Pagos() {
  const tr = useTr()
  const { lang } = useLang()
  const { transactions, byId, members, membershipPrice, setMembershipPrice, addAudit } = useStore()
  const [filter, setFilter] = useState<'todos' | TxEstado>('todos')
  const [receipt, setReceipt] = useState<Transaction | null>(null)
  const [price, setPrice] = useState(String(membershipPrice))

  const now = new Date()
  const month = transactions.filter((t) => t.estado === 'aprobado' && isSameMonth(new Date(t.fecha), now))
  const list = transactions.filter((t) => filter === 'todos' || t.estado === filter)
  const active = members.filter((m) => m.pago === 'ok' && m.estado !== 'rechazado').length

  return (
    <div>
      <PageHeader title={tr('Pagos y membresías', 'Payments & memberships')} subtitle={tr('Cobros de membresía, estados de transacción, recibos y reembolsos.', 'Membership charges, transaction statuses, receipts and refunds.')} />
      <PreviewBanner
        id="admin-pagos"
        bullets={[
          tr('La membresía se cobra dentro del onboarding y desbloquea el acceso.', 'The membership is charged during onboarding and unlocks access.'),
          tr('Recibo PDF automático para cada pago.', 'Automatic PDF receipt for every payment.'),
          tr('Reembolso del 100% si el candidato no es aprobado.', '100% refund if the candidate isn’t approved.'),
        ]}
      />
      <DevNotice
        className="mb-4"
        title={tr('Cobro con Stripe', 'Stripe payments')}
        now={tr('Ahora simulamos el pago aprobado.', 'We now simulate the payment as approved.')}
        later={tr('Al desarrollar, el cobro se procesa de verdad y desbloquea el acceso automáticamente.', 'Once built, the charge is processed for real and unlocks access automatically.')}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kpi label={tr('Ingresos del mes', 'Revenue this month')} value={fmtUSD(month.reduce((s, t) => s + t.monto, 0), lang)} delta="+14%" icon={<Wallet className="h-4 w-4" />} />
        <Kpi label={tr('Membresías activas', 'Active memberships')} value={active} icon={<BadgeCheck className="h-4 w-4" />} hint={tr('en esta muestra de miembros', 'in this member sample')} />
        <Kpi label={tr('Pagos fallidos', 'Failed payments')} value={transactions.filter((t) => t.estado === 'fallido').length} icon={<AlertCircle className="h-4 w-4" />} />
        <Kpi label={tr('Reembolsos', 'Refunds')} value={transactions.filter((t) => t.estado === 'reembolsado').length} icon={<RotateCcw className="h-4 w-4" />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-3">
            <p className="px-2 text-[15px] font-semibold">{tr('Transacciones', 'Transactions')}</p>
            <Tabs
              value={filter}
              onChange={setFilter}
              items={[
                { value: 'todos', label: tr('Todas', 'All'), count: transactions.length },
                { value: 'aprobado', label: tr('Aprobadas', 'Approved') },
                { value: 'fallido', label: tr('Fallidas', 'Failed') },
                { value: 'reembolsado', label: tr('Reembolsadas', 'Refunded') },
                { value: 'pendiente', label: tr('Pendientes', 'Pending') },
              ]}
            />
          </div>
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="sticky top-0 bg-surface-2">
                <tr className="text-left">
                  <th className="label-xs px-4 py-2.5">ID</th>
                  <th className="label-xs px-3 py-2.5">{tr('Miembro', 'Member')}</th>
                  <th className="label-xs px-3 py-2.5">{tr('Concepto', 'Item')}</th>
                  <th className="label-xs px-3 py-2.5 text-right">USD</th>
                  <th className="label-xs px-3 py-2.5">{tr('Estado', 'Status')}</th>
                  <th className="label-xs px-3 py-2.5">{tr('Fecha', 'Date')}</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((t) => {
                  const m = byId(t.memberId)
                  return (
                    <tr key={t.id} className="hover:bg-surface-2">
                      <td className="num px-4 py-2 text-xs text-muted">{t.id}</td>
                      <td className="px-3 py-2">
                        {m && (
                          <div className="flex items-center gap-2">
                            <MemberPhoto member={m} size="xs" />
                            <span className="truncate">{m.nombre} {m.apellido}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted">{tr('Membresía de la agencia', 'Agency membership')}</td>
                      <td className="num px-3 py-2 text-right">{t.monto}</td>
                      <td className="px-3 py-2"><TxBadge estado={t.estado} /></td>
                      <td className="whitespace-nowrap px-3 py-2 text-muted">{format(new Date(t.fecha), 'd MMM yyyy', { locale: dateLocale(lang) })}</td>
                      <td className="px-3 py-2">
                        <button className="btn-ghost btn-sm h-7" onClick={() => setReceipt(t)} title={tr('Descargar recibo', 'Download receipt')}>
                          <FileDown className="h-3.5 w-3.5" /> <span className="hidden xl:inline">{tr('Recibo', 'Receipt')}</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card h-fit">
          <CardHeader title={tr('Configuración de membresía', 'Membership settings')} subtitle={tr('Monto único que se cobra en el onboarding', 'One-time amount charged during onboarding')} />
          <div className="space-y-3 p-5">
            <label className="block">
              <span className="label-xs">{tr('Monto (USD)', 'Amount (USD)')}</span>
              <input className="input num mt-1 text-lg" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} />
            </label>
            <p className="text-xs text-muted">{tr('Incluye entrevista psicológica y acceso a presentaciones.', 'Includes psychological interview and access to introductions.')}</p>
            <button
              className="btn-primary w-full"
              disabled={!price || Number(price) === membershipPrice}
              onClick={() => {
                setMembershipPrice(Number(price))
                addAudit('Viviana', 'config', { es: `Actualizó el monto de la membresía a USD ${price}`, en: `Updated membership price to USD ${price}` })
                toast.success(tr(`Nuevo monto: USD ${price}. Aplica a próximos cobros.`, `New amount: USD ${price}. Applies to upcoming charges.`))
              }}
            >
              {tr('Guardar monto', 'Save amount')}
            </button>
          </div>
        </div>
      </div>

      <Modal open={!!receipt} onOpenChange={(v) => !v && setReceipt(null)} title={tr('Recibo de pago', 'Payment receipt')}>
        {receipt && (
          <>
            <div className="rounded-xl border border-border p-4 text-sm">
              <div className="flex justify-between"><span className="text-muted">{tr('Comprobante', 'Receipt')}</span><span className="num">{receipt.id}</span></div>
              <div className="mt-1.5 flex justify-between"><span className="text-muted">{tr('Miembro', 'Member')}</span><span>{byId(receipt.memberId)?.nombre} {byId(receipt.memberId)?.apellido}</span></div>
              <div className="mt-1.5 flex justify-between"><span className="text-muted">{tr('Concepto', 'Item')}</span><span>{tr('Membresía de la agencia', 'Agency membership')}</span></div>
              <div className="mt-1.5 flex justify-between"><span className="text-muted">{tr('Fecha', 'Date')}</span><span>{format(new Date(receipt.fecha), 'd MMM yyyy', { locale: dateLocale(lang) })}</span></div>
              <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold"><span>Total</span><span className="num">{fmtUSD(receipt.monto, lang)}</span></div>
            </div>
            <DevNotice
              compact
              className="mt-3"
              title={tr('Recibo PDF', 'PDF receipt')}
              now={tr('Ahora mostramos el recibo en pantalla.', 'We now show the receipt on screen.')}
              later={tr('Al desarrollar, se genera el PDF y se envía por email automáticamente.', 'Once built, the PDF is generated and emailed automatically.')}
            />
            <button className="btn-primary mt-4 w-full" onClick={() => { toast.success(tr('Recibo descargado (demo)', 'Receipt downloaded (demo)')); setReceipt(null) }}>
              <FileDown className="h-4 w-4" /> {tr('Descargar recibo', 'Download receipt')}
            </button>
          </>
        )}
      </Modal>
    </div>
  )
}
