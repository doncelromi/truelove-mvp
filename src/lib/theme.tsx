import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'
type Ctx = { theme: Theme; toggle: () => void }
const ThemeCtx = createContext<Ctx>({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )
  useEffect(() => {
    const d = document.documentElement
    d.classList.toggle('dark', theme === 'dark')
    d.style.backgroundColor = theme === 'dark' ? '#09090b' : '#ffffff'
    try {
      localStorage.setItem('tl_theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])
  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  const v = useMemo(() => ({ theme, toggle }), [theme, toggle])
  return <ThemeCtx.Provider value={v}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => useContext(ThemeCtx)
