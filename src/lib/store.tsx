import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { INITIAL_MEMBERS, MARTIN_ID, PRESENTED_PAIRS } from '@/data/members'
import {
  INITIAL_AUDIT,
  INITIAL_AUTOMATIONS,
  INITIAL_AUTOMATION_LOGS,
  INITIAL_INTERVIEWS,
  INITIAL_SUGGESTIONS,
  INITIAL_TRANSACTIONS,
  MEMBERSHIP_PRICE,
} from '@/data/ops'
import type {
  AdvancedToggles,
  AuditLog,
  Automation,
  AutomationLog,
  HardFilters,
  Interview,
  ManualSuggestion,
  MatchWeights,
  Member,
  Photo,
  Song,
  Transaction,
} from '@/data/types'
import type { Bi } from './i18n'
import { DEFAULT_ADVANCED, DEFAULT_FILTERS, DEFAULT_WEIGHTS, type ScoreContext } from './score'

export type Decision = 'interesa' | 'no'

type Store = {
  members: Member[]
  byId: (id: string) => Member | undefined
  updateMember: (id: string, patch: Partial<Member> | ((m: Member) => Partial<Member>)) => void
  interviews: Interview[]
  setInterviews: React.Dispatch<React.SetStateAction<Interview[]>>
  transactions: Transaction[]
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
  automations: Automation[]
  setAutomations: React.Dispatch<React.SetStateAction<Automation[]>>
  automationLogs: AutomationLog[]
  audit: AuditLog[]
  addAudit: (actor: string, tipo: AuditLog['tipo'], accion: Bi) => void
  suggestions: ManualSuggestion[]
  setSuggestions: React.Dispatch<React.SetStateAction<ManualSuggestion[]>>
  weights: MatchWeights
  setWeights: React.Dispatch<React.SetStateAction<MatchWeights>>
  advanced: AdvancedToggles
  setAdvanced: React.Dispatch<React.SetStateAction<AdvancedToggles>>
  filters: HardFilters
  setFilters: React.Dispatch<React.SetStateAction<HardFilters>>
  presented: [string, string][]
  addPresented: (a: string, b: string) => void
  scoreCtx: ScoreContext
  membershipPrice: number
  setMembershipPrice: (n: number) => void
  // fotos / canciones
  addPhotos: (memberId: string, files: File[]) => number
  setCover: (memberId: string, photoId: string) => void
  removePhoto: (memberId: string, photoId: string) => void
  reorderPhotos: (memberId: string, ids: string[]) => void
  addSong: (memberId: string, s: Omit<Song, 'id' | 'orden' | 'esCancionIdeal'>) => void
  removeSong: (memberId: string, songId: string) => void
  reorderSongs: (memberId: string, ids: string[]) => void
  setIdealSong: (memberId: string, songId: string) => void
  // camino del usuario (Martín)
  onboardingStep: number // paso actual (1..5); 6 = aprobado
  setOnboardingStep: (n: number) => void
  decisions: Record<string, Decision>
  decide: (memberId: string, d: Decision) => void
}

const Ctx = createContext<Store | null>(null)

export const MAX_PHOTOS = 6
export const MAX_SONGS = 5

export function StoreProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS)
  const [interviews, setInterviews] = useState<Interview[]>(INITIAL_INTERVIEWS)
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [automations, setAutomations] = useState<Automation[]>(INITIAL_AUTOMATIONS)
  const [automationLogs] = useState<AutomationLog[]>(INITIAL_AUTOMATION_LOGS)
  const [audit, setAudit] = useState<AuditLog[]>(INITIAL_AUDIT)
  const [suggestions, setSuggestions] = useState<ManualSuggestion[]>(INITIAL_SUGGESTIONS)
  const [weights, setWeights] = useState<MatchWeights>(DEFAULT_WEIGHTS)
  const [advanced, setAdvanced] = useState<AdvancedToggles>(DEFAULT_ADVANCED)
  const [filters, setFilters] = useState<HardFilters>(DEFAULT_FILTERS)
  const [presented, setPresented] = useState<[string, string][]>(PRESENTED_PAIRS)
  const [membershipPrice, setMembershipPrice] = useState(MEMBERSHIP_PRICE)
  const [onboardingStep, setOnboardingStep] = useState(4)
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})

  const byId = useCallback((id: string) => members.find((m) => m.id === id), [members])

  const updateMember = useCallback<Store['updateMember']>((id, patch) => {
    setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, ...(typeof patch === 'function' ? patch(m) : patch) } : m)))
  }, [])

  const addAudit = useCallback<Store['addAudit']>((actor, tipo, accion) => {
    setAudit((a) => [{ id: `au${Date.now()}`, fecha: new Date().toISOString(), actor, tipo, accion }, ...a])
  }, [])

  const addPresented = useCallback((a: string, b: string) => setPresented((p) => [...p, [a, b]]), [])

  const addPhotos = useCallback<Store['addPhotos']>(
    (memberId, files) => {
      const m = members.find((x) => x.id === memberId)
      if (!m) return 0
      const room = MAX_PHOTOS - m.fotos.length
      const accepted = files.filter((f) => /image\/(jpeg|png|webp)/.test(f.type)).slice(0, room)
      if (!accepted.length) return 0
      const newPhotos: Photo[] = accepted.map((f, i) => ({
        id: `up-${Date.now()}-${i}`,
        url: URL.createObjectURL(f),
        esPortada: false,
        orden: 0,
      }))
      updateMember(memberId, (mm) => {
        const sorted = [...mm.fotos].sort((a, b) => a.orden - b.orden)
        const cover = sorted.find((p) => p.esPortada)
        // si la portada actual es un placeholder, la primera foto real pasa a ser portada y va primero
        if (!cover?.url) {
          const all = [...newPhotos, ...sorted].map((p, i) => ({ ...p, esPortada: i === 0 }))
          return { fotos: all.map((p, i) => ({ ...p, orden: i })) }
        }
        return { fotos: [...sorted, ...newPhotos].map((p, i) => ({ ...p, orden: i })) }
      })
      return accepted.length
    },
    [members, updateMember],
  )

  const setCover = useCallback<Store['setCover']>(
    (memberId, photoId) =>
      updateMember(memberId, (m) => ({ fotos: m.fotos.map((p) => ({ ...p, esPortada: p.id === photoId })) })),
    [updateMember],
  )
  const removePhoto = useCallback<Store['removePhoto']>(
    (memberId, photoId) =>
      updateMember(memberId, (m) => {
        const rest = m.fotos.filter((p) => p.id !== photoId)
        if (rest.length && !rest.some((p) => p.esPortada)) rest[0] = { ...rest[0], esPortada: true }
        return { fotos: rest.map((p, i) => ({ ...p, orden: i })) }
      }),
    [updateMember],
  )
  const reorderPhotos = useCallback<Store['reorderPhotos']>(
    (memberId, ids) =>
      updateMember(memberId, (m) => ({
        fotos: ids.map((id, i) => ({ ...m.fotos.find((p) => p.id === id)!, orden: i })),
      })),
    [updateMember],
  )
  const addSong = useCallback<Store['addSong']>(
    (memberId, s) =>
      updateMember(memberId, (m) => ({
        canciones: [
          ...m.canciones,
          { ...s, id: `song-${Date.now()}`, orden: m.canciones.length, esCancionIdeal: m.canciones.length === 0 },
        ],
      })),
    [updateMember],
  )
  const removeSong = useCallback<Store['removeSong']>(
    (memberId, songId) =>
      updateMember(memberId, (m) => {
        const rest = m.canciones.filter((s) => s.id !== songId)
        if (rest.length && !rest.some((s) => s.esCancionIdeal)) rest[0] = { ...rest[0], esCancionIdeal: true }
        return { canciones: rest.map((s, i) => ({ ...s, orden: i })) }
      }),
    [updateMember],
  )
  const reorderSongs = useCallback<Store['reorderSongs']>(
    (memberId, ids) =>
      updateMember(memberId, (m) => ({
        canciones: ids.map((id, i) => ({ ...m.canciones.find((s) => s.id === id)!, orden: i })),
      })),
    [updateMember],
  )
  const setIdealSong = useCallback<Store['setIdealSong']>(
    (memberId, songId) =>
      updateMember(memberId, (m) => ({ canciones: m.canciones.map((s) => ({ ...s, esCancionIdeal: s.id === songId })) })),
    [updateMember],
  )

  const decide = useCallback<Store['decide']>(
    (memberId, d) => {
      setDecisions((x) => ({ ...x, [memberId]: d }))
      updateMember(MARTIN_ID, (m) => ({
        rechazados: d === 'no' ? [...new Set([...m.rechazados, memberId])] : m.rechazados.filter((r) => r !== memberId),
      }))
    },
    [updateMember],
  )

  const scoreCtx = useMemo<ScoreContext>(() => ({ byId, presented }), [byId, presented])

  const value = useMemo<Store>(
    () => ({
      members, byId, updateMember,
      interviews, setInterviews,
      transactions, setTransactions,
      automations, setAutomations, automationLogs,
      audit, addAudit,
      suggestions, setSuggestions,
      weights, setWeights, advanced, setAdvanced, filters, setFilters,
      presented, addPresented, scoreCtx,
      membershipPrice, setMembershipPrice,
      addPhotos, setCover, removePhoto, reorderPhotos,
      addSong, removeSong, reorderSongs, setIdealSong,
      onboardingStep, setOnboardingStep,
      decisions, decide,
    }),
    [members, byId, updateMember, interviews, transactions, automations, automationLogs, audit, addAudit, suggestions,
      weights, advanced, filters, presented, addPresented, scoreCtx, membershipPrice, addPhotos, setCover, removePhoto,
      reorderPhotos, addSong, removeSong, reorderSongs, setIdealSong, onboardingStep, decisions, decide],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('StoreProvider missing')
  return s
}

export const coverOf = (m: Member) => {
  const sorted = [...m.fotos].sort((a, b) => a.orden - b.orden)
  return sorted.find((p) => p.esPortada) ?? sorted[0]
}
