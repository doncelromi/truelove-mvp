import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import Shell from '@/components/shell/Shell'
import TrailerMode from '@/components/trailer/TrailerMode'
import { roleForPath } from '@/lib/routes'
import { SessionProvider, useSession } from '@/lib/session'
import { StoreProvider } from '@/lib/store'
import { useTheme } from '@/lib/theme'
import Login from '@/pages/Login'
import Registro from '@/pages/Registro'
import Propuesta from '@/pages/Propuesta'
import Panel from '@/pages/admin/Panel'
import Usuarios from '@/pages/admin/Usuarios'
import UsuarioDetalle from '@/pages/admin/UsuarioDetalle'
import Matches from '@/pages/admin/Matches'
import Calendario from '@/pages/admin/Calendario'
import Pagos from '@/pages/admin/Pagos'
import Automatizaciones from '@/pages/admin/Automatizaciones'
import Roles from '@/pages/admin/Roles'
import Agenda from '@/pages/psico/Agenda'
import Perfiles from '@/pages/psico/Perfiles'
import Entrevistas from '@/pages/psico/Entrevistas'
import EntrevistaDetalle from '@/pages/psico/EntrevistaDetalle'
import Sugerencias from '@/pages/psico/Sugerencias'
import Onboarding from '@/pages/user/Onboarding'
import Perfil from '@/pages/user/Perfil'
import MisMatches from '@/pages/user/MisMatches'
import MiEntrevista from '@/pages/user/MiEntrevista'
import MisPagos from '@/pages/user/MisPagos'

/** Protege las rutas internas y alinea el rol con la ruta (links profundos / refresh) */
function Guard() {
  const { logged, role, setRole, trailer } = useSession()
  const loc = useLocation()
  const routeRole = roleForPath(loc.pathname)
  useEffect(() => {
    if (logged && routeRole && routeRole !== role) setRole(routeRole)
  }, [logged, routeRole, role, setRole])
  if (!logged && !trailer) return <Navigate to="/login" replace />
  return <Shell />
}

function ThemedToaster() {
  const { theme } = useTheme()
  return <Toaster theme={theme} position="top-center" richColors closeButton toastOptions={{ style: { fontFamily: 'Inter' } }} />
}

export default function App() {
  return (
    <SessionProvider>
      <StoreProvider>
        <ThemedToaster />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/trailer" element={<TrailerMode />} />
          <Route element={<Guard />}>
            <Route path="/propuesta" element={<Propuesta />} />
            <Route path="/admin/panel" element={<Panel />} />
            <Route path="/admin/usuarios" element={<Usuarios />} />
            <Route path="/admin/usuarios/:id" element={<UsuarioDetalle />} />
            <Route path="/admin/matches" element={<Matches />} />
            <Route path="/admin/calendario" element={<Calendario />} />
            <Route path="/admin/pagos" element={<Pagos />} />
            <Route path="/admin/automatizaciones" element={<Automatizaciones />} />
            <Route path="/admin/roles" element={<Roles />} />
            <Route path="/psico/agenda" element={<Agenda />} />
            <Route path="/psico/perfiles" element={<Perfiles />} />
            <Route path="/psico/entrevistas" element={<Entrevistas />} />
            <Route path="/psico/entrevistas/:id" element={<EntrevistaDetalle />} />
            <Route path="/psico/sugerencias" element={<Sugerencias />} />
            <Route path="/mi/onboarding" element={<Onboarding />} />
            <Route path="/mi/perfil" element={<Perfil />} />
            <Route path="/mi/matches" element={<MisMatches />} />
            <Route path="/mi/entrevista" element={<MiEntrevista />} />
            <Route path="/mi/pagos" element={<MisPagos />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </StoreProvider>
    </SessionProvider>
  )
}
