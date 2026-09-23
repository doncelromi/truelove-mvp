import type { Bi } from './i18n'
import { CIUDADES, FE, HOBBIES, PRACTICA, VALORES } from '@/data/catalog'
import type {
  AdvancedToggles,
  CriterionKey,
  HardFilters,
  Hijos,
  Member,
  MatchWeights,
  Practica,
} from '@/data/types'

export const DEFAULT_WEIGHTS: MatchWeights = {
  intencion: 9,
  hijos: 9,
  fe: 7,
  valores: 8,
  edad: 5,
  distancia: 4,
  educacion: 3,
  estilo: 5,
  intereses: 6,
  politica: 2,
}

export const DEFAULT_ADVANCED: AdvancedToggles = {
  emocional: { on: true, peso: 6 },
  notasPsico: { on: true, peso: 5 },
  aprender: { on: true, peso: 5 },
  evitarRepetidos: { on: true },
}

export const DEFAULT_FILTERS: HardFilters = {
  excluirRechazados: true,
  excluirPausa: true,
  hijosExcluyente: true,
  feExcluyente: false,
  edadMin: 28,
  edadMax: 55,
  distanciaMax: 1200,
}

export type FactorKey = CriterionKey | 'emocional'
export type Factor = { key: FactorKey; sim: number; weight: number; points: number }
export type ExclusionKind = 'rechazado' | 'pausa' | 'hijos' | 'fe' | 'edad' | 'distancia' | 'repetido'

export type ScoreResult = {
  score: number
  base: number
  factors: Factor[]
  psicoAdj: number
  rejectPenalty: number
  sharedArtists: string[]
  coinciden: Bi[]
  divergen: Bi[]
  chips: Bi[]
  excluded?: { kind: ExclusionKind; reason: Bi }
}

export type ScoreContext = {
  byId?: (id: string) => Member | undefined
  presented?: [string, string][]
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const jaccard = (a: string[], b: string[]) => {
  if (!a.length || !b.length) return 0
  const s = new Set(a)
  const inter = b.filter((x) => s.has(x)).length
  return inter / new Set([...a, ...b]).size
}
const shared = (a: string[], b: string[]) => a.filter((x) => b.includes(x))

const INT_IDX = { '<1a': 0, '1-2a': 1, '2-3a': 2 } as const
const PRACT_IDX: Record<Practica, number> = { semanal: 3, mensual: 2, ocasional: 1, 'no practica': 0 }
const EDU_IDX = { secundario: 0, terciario: 1, universitario: 2, posgrado: 3 } as const
const POL_IDX = { 'centro-izquierda': 0, centro: 1, 'centro-derecha': 2 } as const
const wantsKids = (h: Hijos) => h === 'quiere' || h === 'tiene y quiere más'

const HIJOS_SIM: Record<Hijos, Record<Hijos, number>> = {
  quiere: { quiere: 1, 'tiene y quiere más': 0.9, 'no quiere': 0, 'tiene, no quiere más': 0.3 },
  'tiene y quiere más': { quiere: 0.9, 'tiene y quiere más': 1, 'no quiere': 0.1, 'tiene, no quiere más': 0.3 },
  'no quiere': { quiere: 0, 'tiene y quiere más': 0.1, 'no quiere': 1, 'tiene, no quiere más': 0.8 },
  'tiene, no quiere más': { quiere: 0.3, 'tiene y quiere más': 0.3, 'no quiere': 0.8, 'tiene, no quiere más': 1 },
}

export function distanceKm(a: Member, b: Member) {
  const pa = CIUDADES[a.ciudad] ?? [0, 0]
  const pb = CIUDADES[b.ciudad] ?? [0, 0]
  return Math.round(Math.hypot(pa[0] - pb[0], pa[1] - pb[1]))
}

export function questionnaireSim(a: Member, b: Member) {
  const bm = new Map(b.cuestionario.map((x) => [x.qid, x.value]))
  const diffs = a.cuestionario.filter((x) => bm.has(x.qid)).map((x) => Math.abs(x.value - (bm.get(x.qid) ?? 3)))
  if (diffs.length < 3) return 0.5
  return 1 - diffs.reduce((s, d) => s + d, 0) / diffs.length / 4
}

export function sharedArtistsOf(a: Member, b: Member) {
  const artB = new Set(b.canciones.map((s) => s.artista))
  return [...new Set(a.canciones.map((s) => s.artista).filter((x) => artB.has(x)))]
}

function criterionSims(a: Member, b: Member): Record<CriterionKey, number> {
  const intDiff = Math.abs(INT_IDX[a.intencionCasarse] - INT_IDX[b.intencionCasarse])
  const practDiff = Math.abs(PRACT_IDX[a.practicaReligiosa] - PRACT_IDX[b.practicaReligiosa])
  const sameFe = a.fe === b.fe
  const secular = (f: string) => f === 'agnostica' || f === 'espiritual'
  const feSim = sameFe
    ? 1 - 0.22 * practDiff
    : secular(a.fe) && secular(b.fe)
      ? 0.75
      : secular(a.fe) || secular(b.fe)
        ? 0.15
        : 0.4 - 0.08 * practDiff
  const ageDiff = Math.abs(a.edad - b.edad)
  const dist = distanceKm(a, b)
  const eduDiff = Math.abs(EDU_IDX[a.educacion] - EDU_IDX[b.educacion])
  const estilo =
    a.estiloVida === b.estiloVida
      ? 1
      : [a.estiloVida, b.estiloVida].sort().join() === 'hogareno,tranquilo' ||
          [a.estiloVida, b.estiloVida].sort().join() === 'activo,social'
        ? 0.65
        : 0.3
  const artists = sharedArtistsOf(a, b).length
  const music = artists ? Math.min(1, 0.7 + 0.15 * artists) : 0
  const hob = Math.min(1, jaccard(a.hobbies, b.hobbies) * 1.6)
  let pol = 0.7
  if (a.politica && b.politica) {
    if (a.politica === b.politica) pol = 1
    else if (a.politica === 'apolitico' || b.politica === 'apolitico') pol = 0.6
    else pol = Math.abs(POL_IDX[a.politica] - POL_IDX[b.politica]) === 1 ? 0.6 : 0.2
  }
  return {
    intencion: [1, 0.6, 0.15][intDiff],
    hijos: HIJOS_SIM[a.hijos][b.hijos],
    fe: clamp(feSim, 0, 1),
    valores: Math.min(1, jaccard(a.valores, b.valores) * 1.5),
    edad: ageDiff <= 3 ? 1 : clamp(1 - (ageDiff - 3) / 12, 0, 1),
    distancia: dist <= 15 ? 1 : dist <= 60 ? 0.8 : dist <= 400 ? 0.4 : 0.15,
    educacion: [1, 0.75, 0.4, 0.2][eduDiff],
    estilo,
    intereses: 0.6 * hob + 0.4 * music,
    politica: pol,
  }
}

function psicoAdjustment(a: Member, b: Member, peso: number) {
  const ta = a.etiquetasPsico
  const tb = b.etiquetasPsico
  const both = (t: string) => ta.includes(t) && tb.includes(t)
  const any = (t: string) => ta.includes(t) || tb.includes(t)
  let adj = 0
  if (both('familia')) adj += 2
  if (any('mismaFe')) adj += a.fe === b.fe ? 2 : -6
  if (both('madurez')) adj += 2
  else if (any('madurez')) adj += 1
  if (any('comunicacion')) adj += 1
  if (any('ansiedad')) adj -= 3
  if (any('duelo')) adj -= 3
  return clamp(Math.round(adj * (peso / 5)), -8, 8)
}

/** Parecido de perfil (para aprender de rechazos) */
export function profileSimilarity(x: Member, y: Member) {
  const parts = [
    x.fe === y.fe ? 1 : 0,
    x.intencionCasarse === y.intencionCasarse ? 1 : 0,
    x.hijos === y.hijos ? 1 : 0,
    x.estiloVida === y.estiloVida ? 1 : 0,
    jaccard(x.valores, y.valores),
    jaccard(x.hobbies, y.hobbies),
    x.politica && x.politica === y.politica ? 1 : 0,
  ]
  return parts.reduce((s, p) => s + p, 0) / parts.length
}

function rejectPenaltyOf(a: Member, b: Member, peso: number, ctx: ScoreContext) {
  if (!ctx.byId) return { penalty: 0, who: undefined as Member | undefined }
  let best = 0
  let who: Member | undefined
  for (const rid of a.rechazados) {
    if (rid === b.id) continue
    const r = ctx.byId(rid)
    if (!r) continue
    const s = profileSimilarity(b, r)
    if (s > best) {
      best = s
      who = r
    }
  }
  if (best <= 0.55) return { penalty: 0, who: undefined }
  return { penalty: Math.round(((best - 0.55) / 0.45) * 2 * peso), who }
}

const list = (keys: string[], map: Record<string, Bi>, lang: 'es' | 'en') =>
  keys.map((k) => map[k]?.[lang].toLowerCase() ?? k).join(', ')

export function computeScore(
  a: Member,
  b: Member,
  weights: MatchWeights,
  advanced: AdvancedToggles,
  filters: HardFilters = DEFAULT_FILTERS,
  ctx: ScoreContext = {},
): ScoreResult {
  const sims = criterionSims(a, b)
  const factors: Factor[] = (Object.keys(weights) as CriterionKey[]).map((k) => ({
    key: k,
    sim: sims[k],
    weight: weights[k],
    points: 0,
  }))
  const qSim = questionnaireSim(a, b)
  if (advanced.emocional.on) factors.push({ key: 'emocional', sim: qSim, weight: advanced.emocional.peso, points: 0 })
  const totalW = factors.reduce((s, f) => s + f.weight, 0) || 1
  for (const f of factors) f.points = (f.weight * f.sim * 100) / totalW
  const base = factors.reduce((s, f) => s + f.points, 0)

  const psicoAdj = advanced.notasPsico.on ? psicoAdjustment(a, b, advanced.notasPsico.peso) : 0
  const rej = advanced.aprender.on ? rejectPenaltyOf(a, b, advanced.aprender.peso, ctx) : { penalty: 0, who: undefined }
  const score = clamp(Math.round(base + psicoAdj - rej.penalty), 0, 100)

  // —— frases legibles ——
  const coinciden: Bi[] = []
  const divergen: Bi[] = []
  const chips: Bi[] = []
  const artists = sharedArtistsOf(a, b)
  const soon = (i: string) => i === '<1a' || i === '1-2a'

  if (a.intencionCasarse === b.intencionCasarse || (soon(a.intencionCasarse) && soon(b.intencionCasarse))) {
    const c =
      a.intencionCasarse === '<1a' && b.intencionCasarse === '<1a'
        ? { es: 'Ambos quieren casarse en menos de 1 año', en: 'Both want to marry within 1 year' }
        : soon(a.intencionCasarse) && soon(b.intencionCasarse)
          ? { es: 'Ambos quieren casarse en <2 años', en: 'Both want to marry in <2 years' }
          : { es: 'Mismo plazo para casarse', en: 'Same marriage timeline' }
    coinciden.push(c)
    chips.push(c)
  } else {
    divergen.push({ es: 'Distinto plazo para casarse', en: 'Different marriage timelines' })
  }
  if (a.fe === b.fe) {
    const c = { es: 'Misma fe', en: 'Same faith' }
    chips.push(c)
    coinciden.push({ es: `Comparten la fe: ${FE[a.fe].es.toLowerCase()}`, en: `Share the same faith: ${FE[a.fe].en.toLowerCase()}` })
    if (a.practicaReligiosa !== b.practicaReligiosa)
      divergen.push({
        es: `Difieren en práctica religiosa: ${PRACTICA[a.practicaReligiosa].es.toLowerCase()} vs ${PRACTICA[b.practicaReligiosa].es.toLowerCase()}`,
        en: `Different religious practice: ${PRACTICA[a.practicaReligiosa].en.toLowerCase()} vs ${PRACTICA[b.practicaReligiosa].en.toLowerCase()}`,
      })
  } else {
    divergen.push({
      es: `Distinta fe: ${FE[a.fe].es.toLowerCase()} y ${FE[b.fe].es.toLowerCase()}`,
      en: `Different faith: ${FE[a.fe].en.toLowerCase()} and ${FE[b.fe].en.toLowerCase()}`,
    })
  }
  if (artists.length) {
    chips.push({ es: 'Comparten gustos musicales', en: 'Share musical taste' })
    coinciden.push({
      es: `Ambos eligieron canciones de ${artists.join(' y ')}`,
      en: `Both picked songs by ${artists.join(' and ')}`,
    })
  }
  if (wantsKids(a.hijos) && wantsKids(b.hijos)) {
    const c = { es: 'Ambos quieren hijos', en: 'Both want children' }
    coinciden.push(c)
    chips.push(c)
  } else if (wantsKids(a.hijos) !== wantsKids(b.hijos)) {
    divergen.push({ es: 'Difieren en deseo de hijos', en: 'Differ on wanting children' })
  }
  const sv = shared(a.valores, b.valores)
  if (sv.length >= 2) {
    const c = { es: `Comparten valores: ${list(sv.slice(0, 3), VALORES, 'es')}`, en: `Shared values: ${list(sv.slice(0, 3), VALORES, 'en')}` }
    coinciden.push(c)
    chips.push({ es: 'Valores en común', en: 'Shared values' })
  }
  const sh = shared(a.hobbies, b.hobbies)
  if (sh.length) coinciden.push({ es: `Les gusta: ${list(sh.slice(0, 3), HOBBIES, 'es')}`, en: `Both enjoy: ${list(sh.slice(0, 3), HOBBIES, 'en')}` })
  const dist = distanceKm(a, b)
  if (dist <= 25) coinciden.push({ es: `Viven cerca (${a.ciudad} y ${b.ciudad})`, en: `Live close by (${a.ciudad} and ${b.ciudad})` })
  else if (dist > 100) divergen.push({ es: `Viven a ~${dist} km de distancia`, en: `Live ~${dist} km apart` })
  if (Math.abs(a.edad - b.edad) > 8) divergen.push({ es: `Diferencia de edad de ${Math.abs(a.edad - b.edad)} años`, en: `${Math.abs(a.edad - b.edad)}-year age gap` })
  if (a.estiloVida === b.estiloVida) coinciden.push({ es: 'Mismo estilo de vida', en: 'Same lifestyle' })
  else if (sims.estilo < 0.5) divergen.push({ es: 'Estilos de vida distintos', en: 'Different lifestyles' })
  if (advanced.emocional.on) {
    if (qSim >= 0.85) coinciden.push({ es: 'Respuestas muy similares en el cuestionario emocional', en: 'Very similar answers in the emotional questionnaire' })
    else if (qSim < 0.7) divergen.push({ es: 'Diferencias en el cuestionario emocional', en: 'Differences in the emotional questionnaire' })
  }
  if (rej.penalty > 0 && rej.who)
    divergen.push({
      es: `Perfil parecido a alguien con quien prefirió no avanzar (−${rej.penalty})`,
      en: `Similar to a profile they previously declined (−${rej.penalty})`,
    })

  // —— exclusiones ——
  let excluded: ScoreResult['excluded']
  const presented = ctx.presented ?? []
  if (filters.excluirRechazados && b.estado === 'rechazado')
    excluded = { kind: 'rechazado', reason: { es: 'Excluido: perfil rechazado', en: 'Excluded: rejected profile' } }
  else if (filters.excluirPausa && b.estado === 'pausa')
    excluded = { kind: 'pausa', reason: { es: 'Excluido: perfil en pausa', en: 'Excluded: paused profile' } }
  else if (filters.hijosExcluyente && wantsKids(a.hijos) !== wantsKids(b.hijos))
    excluded = { kind: 'hijos', reason: { es: 'Excluido: difieren en deseo de hijos', en: 'Excluded: differ on wanting children' } }
  else if (filters.feExcluyente && a.fe !== b.fe)
    excluded = { kind: 'fe', reason: { es: 'Excluido: distinta fe', en: 'Excluded: different faith' } }
  else if (b.edad < filters.edadMin || b.edad > filters.edadMax)
    excluded = { kind: 'edad', reason: { es: 'Excluido: fuera del rango de edad', en: 'Excluded: outside age range' } }
  else if (dist > filters.distanciaMax)
    excluded = { kind: 'distancia', reason: { es: 'Excluido: supera la distancia máxima', en: 'Excluded: beyond max distance' } }
  else if (
    advanced.evitarRepetidos.on &&
    presented.some(([x, y]) => (x === a.id && y === b.id) || (x === b.id && y === a.id))
  )
    excluded = { kind: 'repetido', reason: { es: 'Excluido: ya fueron presentados', en: 'Excluded: already introduced' } }

  return { score, base, factors, psicoAdj, rejectPenalty: rej.penalty, sharedArtists: artists, coinciden, divergen, chips: chips.slice(0, 3), excluded }
}

/** Rankea candidatos del género opuesto para un miembro */
export function rankFor(
  a: Member,
  pool: Member[],
  weights: MatchWeights,
  advanced: AdvancedToggles,
  filters: HardFilters,
  ctx: ScoreContext,
) {
  return pool
    .filter((b) => b.id !== a.id && b.genero !== a.genero && b.estado !== 'incompleto' && b.estado !== 'pendiente')
    .map((b) => ({ member: b, result: computeScore(a, b, weights, advanced, filters, ctx) }))
    .sort((x, y) => {
      if (!!x.result.excluded !== !!y.result.excluded) return x.result.excluded ? 1 : -1
      return y.result.score - x.result.score
    })
}
