import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { es as esLocale, enUS } from 'date-fns/locale'

export type Lang = 'es' | 'en'
export type Bi = { es: string; en: string }

// Diccionario compartido {clave:[es,en]}. Las vistas usan además useTr()/useL('es','en') para copy propio.
const dict = {
  'nav.propuesta': ['Propuesta', 'Proposal'],
  'nav.panel': ['Panel', 'Dashboard'],
  'nav.usuarios': ['Usuarios', 'Members'],
  'nav.matches': ['Motor de matches', 'Match engine'],
  'nav.calendario': ['Calendario', 'Calendar'],
  'nav.pagos': ['Pagos', 'Payments'],
  'nav.automatizaciones': ['Automatizaciones', 'Automations'],
  'nav.roles': ['Roles y auditoría', 'Roles & audit'],
  'nav.agenda': ['Agenda', 'Schedule'],
  'nav.perfiles': ['Perfiles a revisar', 'Profiles to review'],
  'nav.entrevistas': ['Entrevistas', 'Interviews'],
  'nav.sugerencias': ['Sugerir matches', 'Suggest matches'],
  'nav.camino': ['Mi camino', 'My journey'],
  'nav.miperfil': ['Mi perfil', 'My profile'],
  'nav.mismatches': ['Mis matches', 'My matches'],
  'nav.mientrevista': ['Mi entrevista', 'My interview'],
  'nav.mispagos': ['Mis pagos', 'My payments'],
  'nav.more': ['Más', 'More'],
  'role.admin': ['Administradora', 'Administrator'],
  'role.psico': ['Psicóloga', 'Psychologist'],
  'role.user': ['Usuario', 'Member'],
  'kicker.admin': ['PANEL DE LA AGENCIA', 'AGENCY DASHBOARD'],
  'kicker.psico': ['CONSULTORIO', 'PRACTICE'],
  'kicker.user': ['MI CAMINO', 'MY JOURNEY'],
  'kicker.comercial': ['COMERCIAL', 'COMMERCIAL'],
  'cta.start': ['Quiero arrancar', 'Let’s get started'],
  'cta.whatsapp': ['Avanzar por WhatsApp', 'Move forward on WhatsApp'],
  'footer.q': ['¿Te gustó lo que ves? Hablemos y arrancamos.', 'Like what you see? Let’s talk and get started.'],
  powered: ['Powered by Insights', 'Powered by Insights'],
  'demo.preview': ['DEMO PREVIEW', 'DEMO PREVIEW'],
  'switch.label': ['Cambiar vista', 'Switch view'],
  logout: ['Cerrar sesión', 'Log out'],
  tour: ['Tour', 'Tour'],
  'viewing.as': ['Viendo la plataforma como', 'Viewing the platform as'],
  'common.save': ['Guardar', 'Save'],
  'common.cancel': ['Cancelar', 'Cancel'],
  'common.close': ['Cerrar', 'Close'],
  'common.search': ['Buscar…', 'Search…'],
  'common.all': ['Todos', 'All'],
  'common.saved': ['Guardado', 'Saved'],
  'common.view': ['Ver', 'View'],
  'common.years': ['años', 'yrs'],
  indev: ['En desarrollo', 'In development'],
  'theme.toggle': ['Cambiar tema', 'Toggle theme'],
} as const satisfies Record<string, readonly [string, string]>

export type DictKey = keyof typeof dict

type Ctx = { lang: Lang; setLang: (l: Lang) => void }
const LangCtx = createContext<Ctx>({ lang: 'es', setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem('tl_lang') as Lang) || 'es'
    } catch {
      return 'es'
    }
  })
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem('tl_lang', l)
    } catch {
      /* ignore */
    }
  }, [])
  const v = useMemo(() => ({ lang, setLang }), [lang, setLang])
  return <LangCtx.Provider value={v}>{children}</LangCtx.Provider>
}

export const useLang = () => useContext(LangCtx)

export function useT() {
  const { lang } = useLang()
  return useCallback((k: DictKey) => dict[k][lang === 'es' ? 0 : 1], [lang])
}

/** useL('es','en') → string en el idioma actual */
export function useL(es: string, en: string) {
  const { lang } = useLang()
  return lang === 'es' ? es : en
}

/** Traductor inline: const tr = useTr(); tr('hola','hi') */
export function useTr() {
  const { lang } = useLang()
  return useCallback((es: string, en: string) => (lang === 'es' ? es : en), [lang])
}

export const dateLocale = (lang: Lang) => (lang === 'es' ? esLocale : enUS)
