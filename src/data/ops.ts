import { addDays, setHours, setMinutes, startOfDay, startOfMonth, subDays, subMonths } from 'date-fns'
import type { Bi } from '@/lib/i18n'
import { INITIAL_MEMBERS, TODAY } from './members'
import type { AuditLog, Automation, AutomationLog, Interview, ManualSuggestion, Transaction } from './types'

export const MEMBERSHIP_PRICE = 480

const at = (dayOffset: number, h: number, m = 0) =>
  setMinutes(setHours(startOfDay(addDays(TODAY, dayOffset)), h), m).toISOString()

const NOTAS_APROBADO: Bi[] = [
  { es: 'Entrevista fluida. Clara intención matrimonial y proyecto de familia. Buena capacidad de escucha.', en: 'Smooth interview. Clear marriage intent and family plans. Good listening skills.' },
  { es: 'Muy orientado/a a la familia. Coherencia entre lo que declara en el perfil y lo que expresa.', en: 'Strongly family-oriented. Consistent between profile and what they express.' },
  { es: 'Madurez emocional alta. Vínculos anteriores elaborados. Apto/a para presentaciones.', en: 'High emotional maturity. Past relationships well processed. Ready for introductions.' },
]
const NOTA_RECHAZO: Bi = {
  es: 'No manifiesta intención matrimonial en el corto plazo. Se sugiere reintentar más adelante.',
  en: 'No short-term marriage intent. Suggest trying again later.',
}

function buildInterviews(): Interview[] {
  const list: Interview[] = []
  const aprobados = INITIAL_MEMBERS.filter((m) => m.estado === 'aprobado').slice(0, 24)
  const rechazados = INITIAL_MEMBERS.filter((m) => m.estado === 'rechazado')
  ;[...aprobados, ...rechazados].forEach((m, i) => {
    const d = addDays(new Date(m.fechaAlta), 4 + (i % 3))
    const fecha = setMinutes(setHours(startOfDay(d), 9 + (i % 8)), i % 2 ? 30 : 0)
    list.push({
      id: `iv${String(list.length + 1).padStart(2, '0')}`,
      memberId: m.id,
      psicologaId: m.psicologaId,
      fecha: fecha.toISOString(),
      modalidad: i % 3 === 0 ? 'presencial' : 'zoom',
      estado: 'realizada',
      resultado: m.estado === 'rechazado' ? 'rechazado' : 'aprobado',
      notas: m.estado === 'rechazado' ? NOTA_RECHAZO : NOTAS_APROBADO[i % 3],
    })
  })
  const upcoming: [string, string, number, number, number, 'zoom' | 'presencial'][] = [
    ['h01', 'p1', 1, 10, 0, 'zoom'],
    ['f07', 'p1', 0, 11, 0, 'presencial'],
    ['h19', 'p1', 0, 15, 0, 'zoom'],
    ['h04', 'p2', 1, 15, 0, 'zoom'],
    ['f20', 'p3', 0, 16, 0, 'zoom'],
    ['h15', 'p3', 2, 9, 30, 'zoom'],
    ['h20', 'p2', 2, 12, 0, 'presencial'],
    ['f12', 'p1', 2, 17, 0, 'presencial'],
    ['h13', 'p1', 3, 10, 0, 'zoom'],
    ['f09', 'p2', 4, 11, 0, 'zoom'],
  ]
  for (const [memberId, psicologaId, d, h, mi, modalidad] of upcoming)
    list.push({ id: `iv${String(list.length + 1).padStart(2, "0")}`, memberId, psicologaId, fecha: at(d, h, mi), modalidad, estado: 'agendada' })
  list.push({ id: `iv${String(list.length + 1).padStart(2, "0")}`, memberId: 'h16', psicologaId: 'p1', fecha: at(1, 17), modalidad: 'zoom', estado: 'cancelada' })
  list.push({ id: `iv${String(list.length + 1).padStart(2, "0")}`, memberId: 'f21', psicologaId: 'p2', fecha: at(3, 9), modalidad: 'presencial', estado: 'cancelada' })
  return list
}
export const INITIAL_INTERVIEWS = buildInterviews()

/** Horarios libres ofrecidos al candidato (onboarding paso 4) */
export function freeSlots(): string[] {
  return [at(1, 10), at(1, 12), at(2, 11), at(2, 16), at(3, 9), at(3, 14), at(4, 10), at(4, 18)]
}

function buildTransactions(): Transaction[] {
  const tx: Transaction[] = []
  const payers = INITIAL_MEMBERS.filter((m) => m.pago === 'ok')
  const monthStart = startOfMonth(TODAY)
  const daysSoFar = Math.max(1, Math.floor((TODAY.getTime() - monthStart.getTime()) / 86400000) + 1)
  // 24 cobros aprobados este mes (USD 11.520)
  for (let i = 0; i < 24; i++) {
    const m = payers[i % payers.length]
    tx.push({ id: '', memberId: m.id, monto: MEMBERSHIP_PRICE, estado: 'aprobado', fecha: addDays(monthStart, i % daysSoFar).toISOString() })
  }
  // 30 cobros aprobados de meses anteriores
  for (let i = 0; i < 30; i++) {
    const m = payers[(i + 7) % payers.length]
    tx.push({ id: '', memberId: m.id, monto: MEMBERSHIP_PRICE, estado: 'aprobado', fecha: subDays(subMonths(monthStart, 1 + (i % 5)), -(i % 27)).toISOString() })
  }
  INITIAL_MEMBERS.filter((m) => m.pago === 'reembolsado').forEach((m, i) =>
    tx.push({ id: '', memberId: m.id, monto: MEMBERSHIP_PRICE, estado: 'reembolsado', fecha: subDays(TODAY, 20 + i * 9).toISOString() }),
  )
  tx.push({ id: '', memberId: 'h24', monto: MEMBERSHIP_PRICE, estado: 'fallido', fecha: subDays(TODAY, 1).toISOString() })
  tx.push({ id: '', memberId: 'f21', monto: MEMBERSHIP_PRICE, estado: 'pendiente', fecha: subDays(TODAY, 2).toISOString() })
  tx.sort((a, b) => b.fecha.localeCompare(a.fecha))
  return tx.map((t, i) => ({ ...t, id: `TL-${String(2060 - i).padStart(4, '0')}` }))
}
export const INITIAL_TRANSACTIONS = buildTransactions()

export const MEMBERSHIP_SERIES = [14, 17, 19, 22, 21, 24].map((v, i) => ({
  month: subMonths(startOfMonth(TODAY), 5 - i).toISOString(),
  value: v,
}))

export const INITIAL_AUTOMATIONS: Automation[] = [
  { id: 'a1', nombre: { es: 'Recordatorio 24h de entrevista', en: '24h interview reminder' }, descripcion: { es: 'Avisa al candidato y a la psicóloga un día antes del turno.', en: 'Notifies the candidate and psychologist one day before.' }, activo: true, canal: 'ambos', enviosMes: 46 },
  { id: 'a2', nombre: { es: 'Confirmación de pago', en: 'Payment confirmation' }, descripcion: { es: 'Envía el recibo y habilita el siguiente paso del onboarding.', en: 'Sends the receipt and unlocks the next onboarding step.' }, activo: true, canal: 'email', enviosMes: 24 },
  { id: 'a3', nombre: { es: 'Nuevo match', en: 'New match' }, descripcion: { es: 'Avisa a ambos miembros cuando la agencia propone una presentación.', en: 'Notifies both members when the agency proposes an introduction.' }, activo: true, canal: 'ambos', enviosMes: 37 },
  { id: 'a4', nombre: { es: 'Usuario inactivo 14 días', en: 'Member inactive for 14 days' }, descripcion: { es: 'Invita a retomar el perfil o el onboarding.', en: 'Invites the member to resume their profile or onboarding.' }, activo: false, canal: 'email', enviosMes: 9 },
  { id: 'a5', nombre: { es: 'Perfil pendiente → psicóloga', en: 'Pending profile → psychologist' }, descripcion: { es: 'Alerta a la psicóloga asignada cuando un perfil queda listo para revisar.', en: 'Alerts the assigned psychologist when a profile is ready for review.' }, activo: true, canal: 'sms', enviosMes: 15 },
]

const nm = (id: string) => {
  const m = INITIAL_MEMBERS.find((x) => x.id === id)
  return m ? `${m.nombre} ${m.apellido}` : id
}

const LOG_SPECS: [string, string, Bi][] = [
  ['a1', 'h01', { es: 'Recordatorio enviado a {n} para mañana 10:00', en: 'Reminder sent to {n} for tomorrow 10:00' }],
  ['a2', 'f16', { es: 'Recibo enviado a {n}', en: 'Receipt sent to {n}' }],
  ['a3', 'h02', { es: 'Aviso de nueva presentación a {n}', en: 'New introduction notice sent to {n}' }],
  ['a5', 'f07', { es: 'Perfil de {n} listo → Lic. Carolina Méndez', en: '{n}’s profile ready → Lic. Carolina Méndez' }],
  ['a1', 'f07', { es: 'Recordatorio enviado a {n} para hoy 11:00', en: 'Reminder sent to {n} for today 11:00' }],
  ['a2', 'h20', { es: 'Recibo enviado a {n}', en: 'Receipt sent to {n}' }],
  ['a3', 'f03', { es: 'Aviso de nueva presentación a {n}', en: 'New introduction notice sent to {n}' }],
  ['a4', 'f24', { es: 'Invitación a completar el perfil a {n}', en: 'Invitation to complete profile sent to {n}' }],
  ['a1', 'h04', { es: 'Recordatorio enviado a {n}', en: 'Reminder sent to {n}' }],
  ['a5', 'h15', { es: 'Perfil de {n} listo → Lic. Andrea Giménez', en: '{n}’s profile ready → Lic. Andrea Giménez' }],
  ['a2', 'h24', { es: 'Pago rechazado por el banco de {n} — se reintentará', en: '{n}’s payment declined by bank — will retry' }],
  ['a3', 'h09', { es: 'Aviso de nueva presentación a {n}', en: 'New introduction notice sent to {n}' }],
  ['a1', 'f20', { es: 'Recordatorio enviado a {n}', en: 'Reminder sent to {n}' }],
  ['a2', 'f07', { es: 'Recibo enviado a {n}', en: 'Receipt sent to {n}' }],
  ['a5', 'f20', { es: 'Perfil de {n} listo → Lic. Andrea Giménez', en: '{n}’s profile ready → Lic. Andrea Giménez' }],
  ['a3', 'f02', { es: 'Aviso de nueva presentación a {n}', en: 'New introduction notice sent to {n}' }],
  ['a4', 'h16', { es: 'Invitación a completar el perfil a {n}', en: 'Invitation to complete profile sent to {n}' }],
  ['a1', 'h19', { es: 'Recordatorio enviado a {n}', en: 'Reminder sent to {n}' }],
  ['a2', 'h01', { es: 'Recibo enviado a {n}', en: 'Receipt sent to {n}' }],
  ['a3', 'h13', { es: 'Aviso de nueva presentación a {n}', en: 'New introduction notice sent to {n}' }],
]
export const INITIAL_AUTOMATION_LOGS: AutomationLog[] = LOG_SPECS.map(([aid, mid, d], i) => ({
  id: `log${i + 1}`,
  automationId: aid,
  fecha: subDays(TODAY, Math.floor(i / 3)).toISOString().replace(/T.*/, `T${String(18 - (i % 9)).padStart(2, '0')}:${i % 2 ? '15' : '40'}:00.000Z`),
  detalle: { es: d.es.replace('{n}', nm(mid)), en: d.en.replace('{n}', nm(mid)) },
  canal: i % 3 === 0 ? 'ambos' : i % 3 === 1 ? 'email' : 'sms',
  ok: aid !== 'a2' || mid !== 'h24',
}))

const AUDIT_SPECS: [string, AuditLog['tipo'], Bi][] = [
  ['Lic. Carolina Méndez', 'perfil', { es: 'Aprobó a Javier Ríos', en: 'Approved Javier Ríos' }],
  ['Viviana', 'motor', { es: 'Cambió el peso “Fe” de 6 a 8', en: 'Changed the “Faith” weight from 6 to 8' }],
  ['Viviana', 'motor', { es: 'Se activó “Aprender de rechazos”', en: 'Enabled “Learn from rejections”' }],
  ['Lic. Paula Iturralde', 'perfil', { es: 'Marcó “En espera” a Nicolás Herrera', en: 'Set Nicolás Herrera “On hold”' }],
  ['Sistema', 'acceso', { es: '5 intentos de login fallidos: gustavo.r@mail.demo', en: '5 failed login attempts: gustavo.r@mail.demo' }],
  ['Viviana', 'pago', { es: 'Inició reembolso a Silvina Moreno', en: 'Started refund for Silvina Moreno' }],
  ['Lic. Andrea Giménez', 'perfil', { es: 'Rechazó a Rodrigo Peralta con motivo', en: 'Rejected Rodrigo Peralta with reason' }],
  ['Viviana', 'config', { es: 'Actualizó el monto de la membresía a USD 480', en: 'Updated membership price to USD 480' }],
  ['Lic. Carolina Méndez', 'motor', { es: 'Sugirió presentar a Tomás Echeverría y Valentina Ferreyra', en: 'Suggested introducing Tomás Echeverría and Valentina Ferreyra' }],
  ['Viviana', 'motor', { es: 'Activó “Hijos como excluyente”', en: 'Enabled “Children as a dealbreaker”' }],
  ['Lic. Paula Iturralde', 'perfil', { es: 'Aprobó a Camila Ortiz', en: 'Approved Camila Ortiz' }],
  ['Viviana', 'config', { es: 'Silenció la automatización “Usuario inactivo 14 días”', en: 'Muted the “Member inactive for 14 days” automation' }],
  ['Lic. Carolina Méndez', 'perfil', { es: 'Agregó la etiqueta “Madurez emocional alta” a Lucía Paz', en: 'Added the “High emotional maturity” tag to Lucía Paz' }],
  ['Viviana', 'acceso', { es: 'Otorgó acceso de psicóloga a Lic. Andrea Giménez', en: 'Granted psychologist access to Lic. Andrea Giménez' }],
  ['Viviana', 'perfil', { es: 'Pausó el perfil de Mercedes Ponce a pedido de la miembro', en: 'Paused Mercedes Ponce’s profile at her request' }],
  ['Lic. Andrea Giménez', 'perfil', { es: 'Aprobó a Julieta Navarro', en: 'Approved Julieta Navarro' }],
  ['Viviana', 'motor', { es: 'Cambió el peso “Distancia” de 6 a 4', en: 'Changed the “Distance” weight from 6 to 4' }],
  ['Sistema', 'pago', { es: 'Pago fallido de Cristian Medina', en: 'Failed payment from Cristian Medina' }],
  ['Lic. Carolina Méndez', 'perfil', { es: 'Aprobó a Valentina Ferreyra', en: 'Approved Valentina Ferreyra' }],
  ['Viviana', 'config', { es: 'Exportó el reporte mensual', en: 'Exported the monthly report' }],
]
export const INITIAL_AUDIT: AuditLog[] = AUDIT_SPECS.map(([actor, tipo, accion], i) => ({
  id: `au${i + 1}`,
  fecha: subDays(TODAY, Math.floor(i * 1.4)).toISOString().replace(/T.*/, `T${String(20 - (i % 10)).padStart(2, '0')}:${i % 2 ? '05' : '32'}:00.000Z`),
  actor,
  tipo,
  accion,
}))

export const INITIAL_SUGGESTIONS: ManualSuggestion[] = [
  { id: 'sg1', aId: 'h09', bId: 'f02', psicologaId: 'p1', comentario: { es: 'Ambos muy comunicativos y con planes de familia similares. Creo que pueden conectar rápido.', en: 'Both very communicative with similar family plans. I think they can connect quickly.' }, estado: 'aceptada', fecha: subDays(TODAY, 6).toISOString() },
  { id: 'sg2', aId: 'h06', bId: 'f08', psicologaId: 'p3', comentario: { es: 'Misma fe y práctica; los dos lo marcaron como condición. Viven en la misma ciudad.', en: 'Same faith and practice; both marked it as a must. They live in the same city.' }, estado: 'propuesta', fecha: subDays(TODAY, 2).toISOString() },
  { id: 'sg3', aId: 'h17', bId: 'f13', psicologaId: 'p2', comentario: { es: 'Perfiles maduros, con hijos y valores tradicionales compartidos.', en: 'Mature profiles with shared traditional values.' }, estado: 'en revisión', fecha: subDays(TODAY, 4).toISOString() },
  { id: 'sg4', aId: 'h23', bId: 'f19', psicologaId: 'p2', comentario: { es: 'Sensibilidad artística y mucha afinidad musical. Vale la pena presentarlos.', en: 'Artistic sensitivity and strong musical affinity. Worth introducing them.' }, estado: 'propuesta', fecha: subDays(TODAY, 1).toISOString() },
  { id: 'sg5', aId: 'h07', bId: 'f14', psicologaId: 'p3', comentario: { es: 'Buena base, pero conviene esperar a que ella cierre un proceso personal.', en: 'Good foundation, but better to wait until she closes a personal process.' }, estado: 'descartada', fecha: subDays(TODAY, 9).toISOString() },
]

export const PENDING_VALIDATION_IDS = INITIAL_MEMBERS.filter((m) => m.estado === 'pendiente').map((m) => m.id)
