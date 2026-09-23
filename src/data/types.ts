import type { Bi } from '@/lib/i18n'

export type Role = 'admin' | 'psico' | 'user'
export type MemberStatus = 'incompleto' | 'pendiente' | 'aprobado' | 'rechazado' | 'pausa'
export type Genero = 'M' | 'F'
export type Fe = 'catolica' | 'evangelica' | 'judia' | 'cristiana' | 'espiritual' | 'agnostica'
export type Practica = 'semanal' | 'mensual' | 'ocasional' | 'no practica'
export type Intencion = '<1a' | '1-2a' | '2-3a'
export type Hijos = 'quiere' | 'no quiere' | 'tiene y quiere más' | 'tiene, no quiere más'
export type Educacion = 'secundario' | 'terciario' | 'universitario' | 'posgrado'
export type EstiloVida = 'activo' | 'tranquilo' | 'social' | 'hogareno'
export type Politica = 'centro' | 'centro-izquierda' | 'centro-derecha' | 'apolitico'
export type Pago = 'ok' | 'pendiente' | 'fallido' | 'reembolsado'

export type Photo = { id: string; url?: string; esPortada: boolean; orden: number }
export type Song = {
  id: string
  titulo: string
  artista: string
  link?: string
  porQue: Bi
  esCancionIdeal: boolean
  orden: number
}
export type Answer = { qid: string; value: number }

export type Member = {
  id: string
  nombre: string
  apellido: string
  genero: Genero
  edad: number
  ciudad: string
  profesion: string // clave de PROFESIONES
  educacion: Educacion
  fe: Fe
  practicaReligiosa: Practica
  intencionCasarse: Intencion
  hijos: Hijos
  valores: string[] // claves de VALORES
  hobbies: string[] // claves de HOBBIES
  estiloVida: EstiloVida
  politica?: Politica
  estado: MemberStatus
  pago: Pago
  psicologaId: string
  fechaAlta: string // ISO
  completitud: number
  bio: Bi
  historia: Bi
  aspiraciones: Bi
  cuestionario: Answer[]
  textoLibre: Bi
  fotos: Photo[]
  canciones: Song[]
  rechazados: string[]
  etiquetasPsico: string[] // claves de TAGS_PSICO
  motivoRechazo?: Bi
}

export type Psicologa = { id: string; nombre: string; color: string; email: string }

export type InterviewEstado = 'agendada' | 'realizada' | 'cancelada'
export type Resultado = 'aprobado' | 'en espera' | 'rechazado'
export type Interview = {
  id: string
  memberId: string
  psicologaId: string
  fecha: string // ISO
  modalidad: 'zoom' | 'presencial'
  estado: InterviewEstado
  resultado?: Resultado
  notas?: Bi
}

export type TxEstado = 'aprobado' | 'pendiente' | 'fallido' | 'reembolsado'
export type Transaction = { id: string; memberId: string; monto: number; estado: TxEstado; fecha: string }

export type Canal = 'email' | 'sms' | 'ambos'
export type Automation = { id: string; nombre: Bi; descripcion: Bi; activo: boolean; canal: Canal; enviosMes: number }
export type AutomationLog = { id: string; automationId: string; fecha: string; detalle: Bi; canal: Canal; ok: boolean }

export type AuditLog = { id: string; fecha: string; actor: string; accion: Bi; tipo: 'perfil' | 'motor' | 'acceso' | 'pago' | 'config' }

export type SugerenciaEstado = 'propuesta' | 'aceptada' | 'en revisión' | 'descartada'
export type ManualSuggestion = {
  id: string
  aId: string
  bId: string
  psicologaId: string
  comentario: Bi
  estado: SugerenciaEstado
  fecha: string
}

export type CriterionKey =
  | 'intencion'
  | 'hijos'
  | 'fe'
  | 'valores'
  | 'edad'
  | 'distancia'
  | 'educacion'
  | 'estilo'
  | 'intereses'
  | 'politica'

export type MatchWeights = Record<CriterionKey, number>

export type AdvancedToggles = {
  emocional: { on: boolean; peso: number }
  notasPsico: { on: boolean; peso: number }
  aprender: { on: boolean; peso: number }
  evitarRepetidos: { on: boolean }
}

export type HardFilters = {
  excluirRechazados: boolean
  excluirPausa: boolean
  hijosExcluyente: boolean
  feExcluyente: boolean
  edadMin: number
  edadMax: number
  distanciaMax: number
}
