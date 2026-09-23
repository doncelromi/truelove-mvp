import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { Role } from '@/data/types'
import { useT } from './i18n'
import { ROLE_LABEL, roleForPath } from './routes'
import { ss, ssClear, ssSet } from './utils'

type Session = {
  logged: boolean
  role: Role
  login: (role: Role) => void
  logout: () => void
  setRole: (r: Role) => void
  welcomeDone: boolean
  setWelcomeDone: (v: boolean) => void
  trailer: boolean
  setTrailer: (v: boolean) => void
  tourNonce: number
  relaunchTour: () => void
}

const Ctx = createContext<Session | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [logged, setLogged] = useState<boolean>(() => ss('tl_logged', false))
  const [role, setRoleState] = useState<Role>(() => ss<Role>('tl_role', 'admin'))
  const [welcomeDone, setWelcomeDoneState] = useState<boolean>(() => ss('tl_welcome_seen', false))
  const [trailer, setTrailer] = useState(false)
  const [tourNonce, setTourNonce] = useState(0)

  const setRole = useCallback((r: Role) => {
    setRoleState(r)
    ssSet('tl_role', r)
  }, [])
  const login = useCallback(
    (r: Role) => {
      setLogged(true)
      ssSet('tl_logged', true)
      setRole(r)
    },
    [setRole],
  )
  const logout = useCallback(() => {
    ssClear()
    setLogged(false)
    setWelcomeDoneState(false)
    setRoleState('admin')
  }, [])
  const setWelcomeDone = useCallback((v: boolean) => {
    setWelcomeDoneState(v)
    ssSet('tl_welcome_seen', v)
  }, [])
  const relaunchTour = useCallback(() => setTourNonce((n) => n + 1), [])

  const v = useMemo(
    () => ({ logged, role, login, logout, setRole, welcomeDone, setWelcomeDone, trailer, setTrailer, tourNonce, relaunchTour }),
    [logged, role, login, logout, setRole, welcomeDone, setWelcomeDone, trailer, tourNonce, relaunchTour],
  )
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}

export function useSession() {
  const s = useContext(Ctx)
  if (!s) throw new Error('SessionProvider missing')
  return s
}

/** go(route): si la ruta es de otro rol, cambia el rol, navega y avisa. */
export function useGo() {
  const navigate = useNavigate()
  const { role, setRole } = useSession()
  const t = useT()
  return useCallback(
    (route: string, opts: { silent?: boolean } = {}) => {
      if (route === 'login') {
        navigate('/login')
        return
      }
      const target = roleForPath(route)
      if (target && target !== role) {
        setRole(target)
        if (!opts.silent) toast(`${t('viewing.as')} ${t(ROLE_LABEL[target])}`)
      }
      navigate(route)
      window.scrollTo({ top: 0 })
    },
    [navigate, role, setRole, t],
  )
}
