import { useCallback } from 'react'
import { toast } from 'sonner'
import type { Member } from '@/data/types'
import { useTr } from './i18n'
import { useSession } from './session'
import { useStore } from './store'
import { ROLE_PERSON } from './routes'

/** Acciones de estado sobre un miembro: mueven de tab, actualizan contadores, auditan y avisan */
export function useMemberActions() {
  const { updateMember, addAudit, setTransactions, membershipPrice } = useStore()
  const { role } = useSession()
  const tr = useTr()
  const actor = role === 'psico' ? ROLE_PERSON.psico : 'Viviana'
  const full = (m: Member) => `${m.nombre} ${m.apellido}`

  const approve = useCallback(
    (m: Member) => {
      updateMember(m.id, { estado: 'aprobado', motivoRechazo: undefined })
      addAudit(actor, 'perfil', { es: `Aprobó a ${full(m)}`, en: `Approved ${full(m)}` })
      toast.success(tr(`${m.nombre} fue aprobado/a y pasó a “Aprobados”`, `${m.nombre} was approved and moved to “Approved”`))
    },
    [updateMember, addAudit, actor, tr],
  )

  const reject = useCallback(
    (m: Member, motivo: string) => {
      const refund = m.pago === 'ok'
      updateMember(m.id, {
        estado: 'rechazado',
        pago: refund ? 'reembolsado' : m.pago,
        motivoRechazo: { es: motivo, en: motivo },
      })
      if (refund)
        setTransactions((t) => [
          { id: `TL-${2061 + t.length}`, memberId: m.id, monto: membershipPrice, estado: 'reembolsado', fecha: new Date().toISOString() },
          ...t,
        ])
      addAudit(actor, 'perfil', { es: `Rechazó a ${full(m)} con motivo`, en: `Rejected ${full(m)} with reason` })
      toast(tr(`${m.nombre} fue rechazado/a`, `${m.nombre} was rejected`), {
        description: refund ? tr('Reembolso iniciado por el 100% de la membresía.', 'Refund started for 100% of the membership.') : undefined,
      })
    },
    [updateMember, setTransactions, membershipPrice, addAudit, actor, tr],
  )

  const pause = useCallback(
    (m: Member) => {
      const paused = m.estado === 'pausa'
      updateMember(m.id, { estado: paused ? 'aprobado' : 'pausa' })
      addAudit(actor, 'perfil', paused ? { es: `Reactivó a ${full(m)}`, en: `Reactivated ${full(m)}` } : { es: `Pausó a ${full(m)}`, en: `Paused ${full(m)}` })
      toast(paused ? tr(`${m.nombre} volvió a estar activo/a`, `${m.nombre} is active again`) : tr(`${m.nombre} quedó en pausa`, `${m.nombre} is now paused`))
    },
    [updateMember, addAudit, actor, tr],
  )

  return { approve, reject, pause }
}
