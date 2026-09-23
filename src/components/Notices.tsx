import { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { ChevronDown, Eye, Info, Wrench } from 'lucide-react'
import { useT, useTr } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** Aviso honesto sobre funciones que requieren infraestructura real */
export function DevNotice({
  title,
  now,
  later,
  className,
  compact = false,
}: {
  title: string
  now: string
  later: string
  className?: string
  compact?: boolean
}) {
  const tr = useTr()
  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border border-amber-300/60 bg-amber-50 text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/[.08] dark:text-amber-200',
        compact ? 'p-2.5 text-xs' : 'p-3.5 text-sm',
        className,
      )}
      role="note"
    >
      <Wrench className={cn('mt-0.5 shrink-0 text-amber-600 dark:text-amber-400', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
      <div className="min-w-0">
        <p className="font-semibold">
          {title} · {tr('función en desarrollo', 'feature in development')}
        </p>
        <p className="mt-0.5 opacity-90">
          {now} {later}
        </p>
      </div>
    </div>
  )
}

const collapsed = new Set<string>() // colapsado solo en memoria: al recargar vuelve a abrirse

export function PreviewBanner({ id, bullets }: { id: string; bullets: string[] }) {
  const tr = useTr()
  const [open, setOpen] = useState(!collapsed.has(id))
  const toggle = () => {
    if (open) collapsed.add(id)
    else collapsed.delete(id)
    setOpen(!open)
  }
  return (
    <div className="no-print mb-6 rounded-xl border border-dashed border-accent/35 bg-accent-soft/60 dark:bg-accent-soft">
      <button onClick={toggle} className="flex w-full flex-wrap items-center gap-2 px-4 py-2.5 text-left">
        <span className="chip bg-accent text-[10px] font-bold tracking-wider text-white">
          <Eye className="h-3 w-3" /> {tr('PREVIEW NAVEGABLE', 'NAVIGABLE PREVIEW')}
        </span>
        <span className="chip border border-accent/30 text-[10px] font-bold tracking-wider text-accent">{tr('DATOS MOCK', 'MOCK DATA')}</span>
        <span className="text-sm font-semibold">{tr('Qué hace este módulo cuando esté funcional', 'What this module does once it’s live')}</span>
        <ChevronDown className={cn('ml-auto h-4 w-4 text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <ul className="grid gap-1.5 px-4 pb-3.5 text-sm text-fg/80 sm:grid-cols-3 sm:gap-4">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Botón ⓘ "En desarrollo" con popover de una frase */
export function InDev({ text, className }: { text: string; className?: string }) {
  const t = useT()
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className={cn('chip border border-border text-muted hover:text-fg', className)}>
          <Info className="h-3 w-3" /> {t('indev')}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={6} className="fade-in z-[80] max-w-[260px] rounded-lg border border-border bg-surface p-3 text-xs shadow-lg">
          {text}
          <Popover.Arrow className="fill-[var(--surface)]" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
