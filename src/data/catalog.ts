import type { Bi, Lang } from '@/lib/i18n'
import type {
  CriterionKey,
  Educacion,
  EstiloVida,
  Fe,
  Hijos,
  Intencion,
  MemberStatus,
  Pago,
  Politica,
  Practica,
  Resultado,
  InterviewEstado,
  TxEstado,
  SugerenciaEstado,
  Canal,
} from './types'

type Map<K extends string> = Record<K, Bi>
export const tx = <K extends string>(m: Map<K>, k: K, lang: Lang) => m[k]?.[lang] ?? k

export const ESTADOS: Map<MemberStatus> = {
  incompleto: { es: 'Incompleto', en: 'Incomplete' },
  pendiente: { es: 'Pendiente', en: 'Pending' },
  aprobado: { es: 'Aprobado', en: 'Approved' },
  rechazado: { es: 'Rechazado', en: 'Rejected' },
  pausa: { es: 'En pausa', en: 'Paused' },
}
export const ESTADOS_VALIDACION: Map<MemberStatus> = {
  incompleto: { es: 'Incompleto', en: 'Incomplete' },
  pendiente: { es: 'Pendiente de revisión', en: 'Pending review' },
  aprobado: { es: 'Aprobado', en: 'Approved' },
  rechazado: { es: 'Rechazado', en: 'Rejected' },
  pausa: { es: 'En pausa', en: 'Paused' },
}
export const PAGOS: Map<Pago> = {
  ok: { es: 'Pagado', en: 'Paid' },
  pendiente: { es: 'Pendiente', en: 'Pending' },
  fallido: { es: 'Fallido', en: 'Failed' },
  reembolsado: { es: 'Reembolsado', en: 'Refunded' },
}
export const TX_ESTADOS: Map<TxEstado> = {
  aprobado: { es: 'Aprobado', en: 'Approved' },
  pendiente: { es: 'Pendiente', en: 'Pending' },
  fallido: { es: 'Fallido', en: 'Failed' },
  reembolsado: { es: 'Reembolsado', en: 'Refunded' },
}
export const FE: Map<Fe> = {
  catolica: { es: 'Católica', en: 'Catholic' },
  evangelica: { es: 'Evangélica', en: 'Evangelical' },
  judia: { es: 'Judía', en: 'Jewish' },
  cristiana: { es: 'Cristiana (otra)', en: 'Christian (other)' },
  espiritual: { es: 'Espiritual sin religión', en: 'Spiritual, not religious' },
  agnostica: { es: 'Agnóstica', en: 'Agnostic' },
}
export const PRACTICA: Map<Practica> = {
  semanal: { es: 'Semanal', en: 'Weekly' },
  mensual: { es: 'Mensual', en: 'Monthly' },
  ocasional: { es: 'Ocasional', en: 'Occasional' },
  'no practica': { es: 'No practica', en: 'Non-practicing' },
}
export const INTENCION: Map<Intencion> = {
  '<1a': { es: 'Casarse en menos de 1 año', en: 'Marry within 1 year' },
  '1-2a': { es: 'Casarse en 1 a 2 años', en: 'Marry in 1–2 years' },
  '2-3a': { es: 'Casarse en 2 a 3 años', en: 'Marry in 2–3 years' },
}
export const HIJOS: Map<Hijos> = {
  quiere: { es: 'Quiere tener hijos', en: 'Wants children' },
  'no quiere': { es: 'No quiere hijos', en: 'Doesn’t want children' },
  'tiene y quiere más': { es: 'Tiene hijos y quiere más', en: 'Has children, wants more' },
  'tiene, no quiere más': { es: 'Tiene hijos, no quiere más', en: 'Has children, no more' },
}
export const EDUCACION: Map<Educacion> = {
  secundario: { es: 'Secundario', en: 'High school' },
  terciario: { es: 'Terciario', en: 'Associate degree' },
  universitario: { es: 'Universitario', en: 'Bachelor’s degree' },
  posgrado: { es: 'Posgrado', en: 'Postgraduate' },
}
export const ESTILO: Map<EstiloVida> = {
  activo: { es: 'Activo y deportivo', en: 'Active & sporty' },
  tranquilo: { es: 'Tranquilo', en: 'Calm' },
  social: { es: 'Social', en: 'Social' },
  hogareno: { es: 'Hogareño', en: 'Homebody' },
}
export const POLITICA: Map<Politica> = {
  centro: { es: 'Centro', en: 'Center' },
  'centro-izquierda': { es: 'Centro-izquierda', en: 'Center-left' },
  'centro-derecha': { es: 'Centro-derecha', en: 'Center-right' },
  apolitico: { es: 'Prefiere no definirse', en: 'Prefers not to say' },
}
export const RESULTADOS: Map<Resultado> = {
  aprobado: { es: 'Aprobado', en: 'Approved' },
  'en espera': { es: 'En espera', en: 'On hold' },
  rechazado: { es: 'Rechazado', en: 'Rejected' },
}
export const INTERVIEW_ESTADOS: Map<InterviewEstado> = {
  agendada: { es: 'Agendada', en: 'Scheduled' },
  realizada: { es: 'Realizada', en: 'Completed' },
  cancelada: { es: 'Cancelada', en: 'Cancelled' },
}
export const MODALIDAD: Map<'zoom' | 'presencial'> = {
  zoom: { es: 'Videollamada', en: 'Video call' },
  presencial: { es: 'Presencial', en: 'In person' },
}
export const SUG_ESTADOS: Map<SugerenciaEstado> = {
  propuesta: { es: 'Propuesta', en: 'Proposed' },
  aceptada: { es: 'Aceptada', en: 'Accepted' },
  'en revisión': { es: 'En revisión', en: 'Under review' },
  descartada: { es: 'Descartada', en: 'Dismissed' },
}
export const CANALES: Map<Canal> = {
  email: { es: 'Email', en: 'Email' },
  sms: { es: 'SMS', en: 'SMS' },
  ambos: { es: 'Email + SMS', en: 'Email + SMS' },
}
export const GENERO: Map<'M' | 'F'> = {
  M: { es: 'Hombre', en: 'Man' },
  F: { es: 'Mujer', en: 'Woman' },
}

export const VALORES: Record<string, Bi> = {
  familia: { es: 'Familia', en: 'Family' },
  honestidad: { es: 'Honestidad', en: 'Honesty' },
  fe: { es: 'Fe', en: 'Faith' },
  lealtad: { es: 'Lealtad', en: 'Loyalty' },
  respeto: { es: 'Respeto', en: 'Respect' },
  trabajo: { es: 'Cultura del trabajo', en: 'Work ethic' },
  humor: { es: 'Sentido del humor', en: 'Sense of humor' },
  solidaridad: { es: 'Solidaridad', en: 'Solidarity' },
  tradicion: { es: 'Tradición', en: 'Tradition' },
  libertad: { es: 'Libertad', en: 'Freedom' },
  generosidad: { es: 'Generosidad', en: 'Generosity' },
  compromiso: { es: 'Compromiso', en: 'Commitment' },
}

export const HOBBIES: Record<string, Bi> = {
  cocina: { es: 'Cocinar', en: 'Cooking' },
  trekking: { es: 'Trekking', en: 'Hiking' },
  lectura: { es: 'Lectura', en: 'Reading' },
  cine: { es: 'Cine', en: 'Movies' },
  viajes: { es: 'Viajar', en: 'Travel' },
  running: { es: 'Running', en: 'Running' },
  musica: { es: 'Música en vivo', en: 'Live music' },
  jardineria: { es: 'Jardinería', en: 'Gardening' },
  yoga: { es: 'Yoga', en: 'Yoga' },
  fotografia: { es: 'Fotografía', en: 'Photography' },
  teatro: { es: 'Teatro', en: 'Theater' },
  futbol: { es: 'Fútbol', en: 'Soccer' },
  tenis: { es: 'Tenis', en: 'Tennis' },
  pintura: { es: 'Pintura', en: 'Painting' },
  voluntariado: { es: 'Voluntariado', en: 'Volunteering' },
  vino: { es: 'Vinos', en: 'Wine' },
  bici: { es: 'Bicicleta', en: 'Cycling' },
  danza: { es: 'Baile', en: 'Dancing' },
}

export const PROFESIONES: Record<string, Bi> = {
  arquitecto: { es: 'Arquitecto', en: 'Architect' },
  arquitecta: { es: 'Arquitecta', en: 'Architect' },
  abogado: { es: 'Abogado', en: 'Lawyer' },
  abogada: { es: 'Abogada', en: 'Lawyer' },
  medico: { es: 'Médico', en: 'Physician' },
  medica: { es: 'Médica', en: 'Physician' },
  contador: { es: 'Contador', en: 'Accountant' },
  contadora: { es: 'Contadora', en: 'Accountant' },
  ingeniero: { es: 'Ingeniero', en: 'Engineer' },
  ingeniera: { es: 'Ingeniera', en: 'Engineer' },
  docente_m: { es: 'Docente', en: 'Teacher' },
  docente_f: { es: 'Docente', en: 'Teacher' },
  disenadora: { es: 'Diseñadora gráfica', en: 'Graphic designer' },
  disenador: { es: 'Diseñador industrial', en: 'Industrial designer' },
  psicopedagoga: { es: 'Psicopedagoga', en: 'Educational psychologist' },
  odontologo: { es: 'Odontólogo', en: 'Dentist' },
  odontologa: { es: 'Odontóloga', en: 'Dentist' },
  nutricionista: { es: 'Nutricionista', en: 'Nutritionist' },
  comerciante: { es: 'Comerciante', en: 'Business owner' },
  empresaria: { es: 'Empresaria', en: 'Entrepreneur' },
  periodista: { es: 'Periodista', en: 'Journalist' },
  veterinaria: { es: 'Veterinaria', en: 'Veterinarian' },
  kinesiologo: { es: 'Kinesiólogo', en: 'Physical therapist' },
  analista: { es: 'Analista de sistemas', en: 'Systems analyst' },
  chef: { es: 'Chef', en: 'Chef' },
  farmaceutica: { es: 'Farmacéutica', en: 'Pharmacist' },
  economista: { es: 'Economista', en: 'Economist' },
  enfermera: { es: 'Enfermera', en: 'Nurse' },
  productor: { es: 'Productor agropecuario', en: 'Farmer' },
  traductora: { es: 'Traductora', en: 'Translator' },
  musico: { es: 'Músico', en: 'Musician' },
  rrhh: { es: 'Líder de RR.HH.', en: 'HR lead' },
  bancario: { es: 'Gerente bancario', en: 'Bank manager' },
  profesora: { es: 'Profesora de Historia', en: 'History teacher' },
}

export const TAGS_PSICO: Record<string, Bi> = {
  familia: { es: 'Muy orientado a familia', en: 'Strongly family-oriented' },
  mismaFe: { es: 'Necesita pareja con misma fe', en: 'Needs a partner of the same faith' },
  madurez: { es: 'Madurez emocional alta', en: 'High emotional maturity' },
  duelo: { es: 'Duelo reciente de pareja', en: 'Recent breakup grief' },
  comunicacion: { es: 'Comunicación asertiva', en: 'Assertive communication' },
  ansiedad: { es: 'Ansiedad ante el compromiso', en: 'Commitment anxiety' },
}

/** coordenadas aproximadas en km para calcular distancias */
export const CIUDADES: Record<string, [number, number]> = {
  Palermo: [0, 0],
  Belgrano: [2, 5],
  Núñez: [3, 8],
  Caballito: [-4, -3],
  Recoleta: [3, -2],
  'San Isidro': [6, 20],
  'Vicente López': [4, 13],
  'La Plata': [40, -45],
  Rosario: [-200, 220],
  Córdoba: [-620, 250],
  Mendoza: [-960, -30],
}

export const CRITERIOS: Record<CriterionKey, Bi> = {
  intencion: { es: 'Intención de casarse y plazo', en: 'Marriage intent & timeline' },
  hijos: { es: 'Deseo de hijos', en: 'Desire for children' },
  fe: { es: 'Fe y práctica religiosa', en: 'Faith & religious practice' },
  valores: { es: 'Valores familiares', en: 'Family values' },
  edad: { es: 'Rango de edad', en: 'Age range' },
  distancia: { es: 'Distancia', en: 'Distance' },
  educacion: { es: 'Nivel educativo', en: 'Education level' },
  estilo: { es: 'Estilo de vida', en: 'Lifestyle' },
  intereses: { es: 'Intereses, hobbies y música', en: 'Interests, hobbies & music' },
  politica: { es: 'Afinidad política', en: 'Political affinity' },
}

export const QUESTIONS: { id: string; text: Bi }[] = [
  { id: 'q1', text: { es: 'Me resulta fácil expresar lo que siento.', en: 'I find it easy to express my feelings.' } },
  { id: 'q2', text: { es: 'Ante un conflicto, prefiero hablarlo en el momento.', en: 'When there is conflict, I prefer to talk it through right away.' } },
  { id: 'q3', text: { es: 'La familia extendida ocupa un lugar central en mi vida.', en: 'My extended family plays a central role in my life.' } },
  { id: 'q4', text: { es: 'Me imagino compartiendo la fe en el día a día de la pareja.', en: 'I picture sharing faith in our everyday life as a couple.' } },
  { id: 'q5', text: { es: 'Valoro tener espacios personales dentro de la pareja.', en: 'I value having personal space within the relationship.' } },
  { id: 'q6', text: { es: 'Las decisiones económicas deben tomarse en conjunto.', en: 'Financial decisions should be made together.' } },
  { id: 'q7', text: { es: 'Me adapto con facilidad a los cambios.', en: 'I adapt easily to change.' } },
  { id: 'q8', text: { es: 'Me siento preparado/a para un compromiso de por vida.', en: 'I feel ready for a lifelong commitment.' } },
  { id: 'q9', text: { es: 'Disfruto más de planes tranquilos que de salidas sociales.', en: 'I enjoy quiet plans more than social outings.' } },
  { id: 'q10', text: { es: 'La pareja se construye con esfuerzo diario.', en: 'A relationship is built through daily effort.' } },
]

export const LIKERT: Bi[] = [
  { es: 'Nada de acuerdo', en: 'Strongly disagree' },
  { es: 'Poco de acuerdo', en: 'Disagree' },
  { es: 'Neutral', en: 'Neutral' },
  { es: 'De acuerdo', en: 'Agree' },
  { es: 'Muy de acuerdo', en: 'Strongly agree' },
]

/** Catálogo de canciones reales (solo título + artista, sin letras ni portadas) */
export const SONGS: Record<string, { titulo: string; artista: string }> = {
  s1: { titulo: 'Todo se transforma', artista: 'Jorge Drexler' },
  s2: { titulo: 'Amar la trama', artista: 'Jorge Drexler' },
  s3: { titulo: 'Sea', artista: 'Jorge Drexler' },
  s4: { titulo: 'Persiana americana', artista: 'Soda Stereo' },
  s5: { titulo: 'De música ligera', artista: 'Soda Stereo' },
  s6: { titulo: 'Té para tres', artista: 'Soda Stereo' },
  s7: { titulo: 'Gracias a la vida', artista: 'Mercedes Sosa' },
  s8: { titulo: 'Alfonsina y el mar', artista: 'Mercedes Sosa' },
  s9: { titulo: 'Burbujas de amor', artista: 'Juan Luis Guerra' },
  s10: { titulo: 'Bachata rosa', artista: 'Juan Luis Guerra' },
  s11: { titulo: 'Yellow', artista: 'Coldplay' },
  s12: { titulo: 'Fix You', artista: 'Coldplay' },
  s13: { titulo: 'Make You Feel My Love', artista: 'Adele' },
  s14: { titulo: 'Someone Like You', artista: 'Adele' },
  s15: { titulo: 'Don’t Know Why', artista: 'Norah Jones' },
  s16: { titulo: 'Come Away With Me', artista: 'Norah Jones' },
  s17: { titulo: 'La incondicional', artista: 'Luis Miguel' },
  s18: { titulo: 'Por debajo de la mesa', artista: 'Luis Miguel' },
  s19: { titulo: 'Hasta que me olvides', artista: 'Luis Miguel' },
  s20: { titulo: 'El amor después del amor', artista: 'Fito Páez' },
  s21: { titulo: 'Mariposa Tecknicolor', artista: 'Fito Páez' },
  s22: { titulo: 'Seminare', artista: 'Serú Girán' },
  s23: { titulo: 'Muchacha (ojos de papel)', artista: 'Almendra' },
  s24: { titulo: 'Perfect', artista: 'Ed Sheeran' },
  s25: { titulo: 'Thinking Out Loud', artista: 'Ed Sheeran' },
  s26: { titulo: 'Ojalá', artista: 'Silvio Rodríguez' },
  s27: { titulo: 'Rayando el sol', artista: 'Maná' },
  s28: { titulo: 'Eres', artista: 'Café Tacvba' },
  s29: { titulo: 'In My Life', artista: 'The Beatles' },
  s30: { titulo: 'Something', artista: 'The Beatles' },
  s31: { titulo: 'La flaca', artista: 'Jarabe de Palo' },
  s32: { titulo: 'Clocks', artista: 'Coldplay' },
}

export const PORQUE: Bi[] = [
  { es: 'Me recuerda los domingos en familia.', en: 'It reminds me of Sundays with family.' },
  { es: 'La escuché en el viaje que me cambió la vida.', en: 'I heard it on the trip that changed my life.' },
  { es: 'Habla de cómo quiero amar: con paciencia.', en: 'It’s about how I want to love: patiently.' },
  { es: 'Mis viejos la bailaban en la cocina.', en: 'My parents used to dance to it in the kitchen.' },
  { es: 'Me acompaña cada vez que empiezo algo nuevo.', en: 'It comes with me whenever I start something new.' },
  { es: 'Es alegría pura, imposible no cantarla.', en: 'Pure joy, impossible not to sing along.' },
  { es: 'La tocaría el día de mi casamiento.', en: 'I would play it on my wedding day.' },
  { es: 'Me hace pensar en lo simple que es ser feliz.', en: 'It makes me think of how simple happiness can be.' },
  { es: 'Me la mostró mi abuela y nunca la solté.', en: 'My grandmother showed it to me and I never let it go.' },
  { es: 'Resume lo que busco: compañerismo.', en: 'It sums up what I’m looking for: partnership.' },
]
