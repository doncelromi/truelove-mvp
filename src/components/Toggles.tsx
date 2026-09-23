import { Moon, Sun } from 'lucide-react'
import { useLang, useT } from '@/lib/i18n'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang()
  return (
    <div className={cn('inline-flex h-8 items-center rounded-lg border border-border bg-surface p-0.5 text-xs font-semibold', className)} role="group" aria-label="Idioma / Language">
      {(['es', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            'h-7 rounded-md px-2 uppercase transition-colors',
            lang === l ? 'bg-accent text-white' : 'text-muted hover:text-fg',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const t = useT()
  return (
    <button
      onClick={toggle}
      aria-label={t('theme.toggle')}
      title={t('theme.toggle')}
      className={cn('inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:text-fg', className)}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

export function DemoPill({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-0.5 text-[10.5px] font-bold tracking-wider text-accent', className)}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      DEMO PREVIEW
    </span>
  )
}
