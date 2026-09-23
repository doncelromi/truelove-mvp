import type { Role } from '@/data/types'
import type { Lang } from '@/lib/i18n'
import { NAV } from '@/lib/routes'

export type TourStep = {
  id: string
  roles: Role[]
  /** selectores en orden de preferencia: se usa el primero visible */
  targets?: string[]
  route?: string
  title: string
  body: string
}

type Copy = Record<string, [string, string, string, string]> // [títuloES, bodyES, títuloEN, bodyEN]

const NAV_COPY: Copy = {
  propuesta: ['Propuesta', 'Acá está todo lo que incluye el desarrollo: el circuito completo del candidato y los 9 módulos. Desde cada módulo, “Ver en el demo” te lleva a verlo funcionando.', 'Proposal', 'Everything the build includes: the full candidate journey and the 9 modules. From each module, “See it in the demo” takes you to it working.'],
  panel: ['Panel', '214 miembros activos, 18 entrevistas esta semana, 37 parejas presentadas y los ingresos del mes. Abajo, alertas accionables como Sofía Ledesma, que pagó hace 9 días y no pidió turno.', 'Dashboard', '214 active members, 18 interviews this week, 37 couples introduced and monthly revenue. Below, actionable alerts like Sofía Ledesma, who paid 9 days ago and hasn’t booked.'],
  usuarios: ['Usuarios', 'Los 48 candidatos por estado: 30 aprobados, 7 pendientes, 4 incompletos, 4 rechazados y 3 en pausa. Aprobás o rechazás con motivo y el reembolso sale solo.', 'Members', 'All 48 candidates by status: 30 approved, 7 pending, 4 incomplete, 4 rejected and 3 paused. Approve or reject with a reason and the refund goes out automatically.'],
  matches: ['Motor de matches', 'La pantalla estrella: movés los pesos y los scores se recalculan en vivo. Javier Ríos y Lucía Paz llegan a 94; tocá cualquier par para ver por qué son compatibles.', 'Match engine', 'The star screen: move the weights and scores recalculate live. Javier Ríos and Lucía Paz reach 94; tap any pair to see why they’re compatible.'],
  calendario: ['Calendario', 'Los turnos de Lic. Carolina Méndez, Lic. Paula Iturralde y Lic. Andrea Giménez, cada una con su color, y las 2 cancelaciones de la semana.', 'Calendar', 'Appointments for Lic. Carolina Méndez, Lic. Paula Iturralde and Lic. Andrea Giménez, each in her own color, plus this week’s 2 cancellations.'],
  pagos: ['Pagos', 'La membresía de USD 480 se cobra en el onboarding: ingresos del mes, pagos fallidos, reembolsos y recibos de cada transacción.', 'Payments', 'The USD 480 membership is charged during onboarding: monthly revenue, failed payments, refunds and receipts for each transaction.'],
  automatizaciones: ['Automatizaciones', '5 avisos automáticos por email y SMS: recordatorio 24 h, confirmación de pago, nuevo match, usuario inactivo y alerta a psicólogas. Cada uno se silencia con un switch.', 'Automations', '5 automatic email and SMS notices: 24h reminder, payment confirmation, new match, inactive member and psychologist alert. Each can be muted with a switch.'],
  roles: ['Roles y auditoría', 'Quién puede ver qué: la matriz de permisos por rol, el equipo y la auditoría de cada cambio, como “Viviana cambió el peso Fe de 6 a 8”.', 'Roles & audit', 'Who can see what: the permission matrix by role, the team and the audit of every change, like “Viviana changed the Faith weight from 6 to 8”.'],
  agenda: ['Agenda', 'La semana de Lic. Carolina Méndez: turnos por estado, horarios libres punteados y el panel “Hoy” con sus entrevistas del día, listas para unirse.', 'Schedule', 'Lic. Carolina Méndez’s week: appointments by status, dotted free slots and the “Today” panel with the day’s interviews, ready to join.'],
  perfiles: ['Perfiles a revisar', 'Su cola de candidatos asignados, con el % de perfil y si ya cargaron fotos, canciones y cuestionario. Agenda la entrevista en un clic.', 'Profiles to review', 'Her queue of assigned candidates, with profile % and whether they’ve added photos, songs and questionnaire. She books the interview in one click.'],
  entrevistas: ['Entrevistas', 'Cada entrevista con notas que se guardan solas y etiquetas como “Muy orientado a familia”, que ajustan el score del motor de compatibilidad.', 'Interviews', 'Each interview with auto-saved notes and tags like “Strongly family-oriented” that adjust the compatibility engine’s score.'],
  sugerencias: ['Sugerir matches', 'La psicóloga propone parejas con su mirada profesional, ve el score al instante y deja un comentario para la administradora.', 'Suggest matches', 'The psychologist proposes couples from her professional view, sees the score instantly and leaves a comment for the administrator.'],
  camino: ['Mi camino', 'El camino de Martín Aguirre en 5 pasos: cuenta, pago, perfil, entrevista y aprobación. Va por el paso 4, eligiendo su turno.', 'My journey', 'Martín Aguirre’s 5-step journey: account, payment, profile, interview and approval. He’s on step 4, picking his appointment.'],
  perfil: ['Mi perfil', 'Su perfil completo: datos, valores, fe, sus propias fotos con portada y “Mi música” con las 3 canciones que lo representan.', 'My profile', 'His full profile: details, values, faith, his own photos with a cover and “My music” with the 3 songs that represent him.'],
  mismatches: ['Mis matches', 'Sus parejas sugeridas con score: Valentina Ferreyra al 91%, con el chip “Comparten gustos musicales” (Jorge Drexler y Coldplay).', 'My matches', 'His suggested matches with score: Valentina Ferreyra at 91%, with the “Share musical taste” chip (Jorge Drexler and Coldplay).'],
  entrevista: ['Mi entrevista', 'Su turno confirmado por videollamada, con recordatorio 24 h antes y la opción de reprogramar o cancelar él mismo.', 'My interview', 'His confirmed video appointment, with a 24h reminder and the option to reschedule or cancel himself.'],
  mispagos: ['Mis pagos', 'Su membresía activa, el recibo y la garantía: si no es aprobado, se le reintegra el 100%.', 'My payments', 'His active membership, the receipt and the guarantee: if not approved, he gets a 100% refund.'],
}

const WELCOME: Record<Role, [string, string, string, string]> = {
  admin: ['Vista de la Administradora', 'Estás viendo la plataforma como Viviana: el panel de la agencia con todos los datos, el motor de matches y la gestión completa.', 'Administrator view', 'You’re seeing the platform as Viviana: the agency dashboard with all the data, the match engine and full management.'],
  psico: ['Vista de la Psicóloga', 'Ahora sos Lic. Carolina Méndez: su agenda, su cola de perfiles y las entrevistas que definen quién entra.', 'Psychologist view', 'Now you’re Lic. Carolina Méndez: her schedule, her profile queue and the interviews that decide who gets in.'],
  user: ['Vista del Usuario', 'Ahora sos Martín Aguirre, 36, arquitecto: la experiencia cálida del candidato, de la cuenta a las parejas sugeridas.', 'Member view', 'Now you’re Martín Aguirre, 36, architect: the candidate’s warm experience, from sign-up to suggested matches.'],
}

export function getTourSteps(role: Role, lang: Lang): TourStep[] {
  const pick = (c: [string, string, string, string]) => (lang === 'es' ? { title: c[0], body: c[1] } : { title: c[2], body: c[3] })
  const all: TourStep[] = [
    ...(['admin', 'psico', 'user'] as Role[]).map((r) => ({ id: `welcome-${r}`, roles: [r], ...pick(WELCOME[r]) })),
    {
      id: 'top-nav',
      roles: ['admin', 'psico', 'user'],
      targets: ['[data-tour="top-nav"]'],
      title: lang === 'es' ? 'La barra de navegación' : 'The navigation bar',
      body:
        lang === 'es'
          ? `Todo el ${role === 'admin' ? 'panel de la agencia' : role === 'psico' ? 'consultorio' : 'camino del candidato'} está acá arriba: primero la Propuesta y después los ${NAV[role].length - 1} módulos de este rol. Te los muestro uno por uno.`
          : `The whole ${role === 'admin' ? 'agency dashboard' : role === 'psico' ? 'practice' : 'candidate journey'} lives up here: first the Proposal, then this role’s ${NAV[role].length - 1} modules. Let me show you each one.`,
    },
  ]
  // un paso por CADA ítem de la nav, en orden visual y numerados
  for (const r of ['admin', 'psico', 'user'] as Role[]) {
    NAV[r].forEach((item, i) => {
      const c = NAV_COPY[item.id]
      const p = pick(c)
      all.push({
        id: `nav-${r}-${item.id}`,
        roles: [r],
        targets: [`[data-tour="nav-${item.id}"]`, '[data-tour="mobile-more"]'],
        route: item.path,
        title: `${i + 1}. ${p.title}`,
        body: p.body,
      })
    })
  }
  all.push(
    {
      id: 'switch-user',
      roles: ['admin', 'psico', 'user'],
      targets: ['[data-tour="switch-user"]'],
      title: lang === 'es' ? 'Cambiar vista' : 'Switch view',
      body:
        lang === 'es'
          ? 'Desde acá pasás en vivo entre Administradora, Psicóloga y Usuario, sin cerrar sesión. Cada rol ve una plataforma distinta.'
          : 'From here you switch live between Administrator, Psychologist and Member, without logging out. Each role sees a different platform.',
    },
    {
      id: 'whatsapp-cta',
      roles: ['admin', 'psico', 'user'],
      targets: ['[data-tour="whatsapp-cta"]'],
      title: lang === 'es' ? 'Quiero arrancar' : 'Let’s get started',
      body:
        lang === 'es'
          ? 'Cuando quieras avanzar, este botón te lleva directo a nuestro WhatsApp. Arrancamos con el relevamiento y en 3 semanas tenés el primer prototipo.'
          : 'Whenever you want to move forward, this button takes you straight to our WhatsApp. We start with discovery and in 3 weeks you have the first prototype.',
    },
  )
  return all.filter((s) => s.roles.includes(role))
}
