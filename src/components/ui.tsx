import { type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as SwitchPrim from '@radix-ui/react-switch'
import * as SliderPrim from '@radix-ui/react-slider'
import { X, TrendingUp, TrendingDown } from 'lucide-react'
import type { MemberStatus, Pago, TxEstado } from '@/data/types'
import { ESTADOS, PAGOS, TX_ESTADOS, tx } from '@/data/catalog'
import { useLang, useT } from '@/lib/i18n'
import { useSession } from '@/lib/session'
import { ROLE_KICKER } from '@/lib/routes'
import { cn } from '@/lib/utils'

/* ——— Modal centrado (fixed inset-0 m-auto h-fit) ——— */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  closeOnOutside = true,
  hideClose = false,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  closeOnOutside?: boolean
  hideClose?: boolean
}) {
  const t = useT()
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fade-in fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm" />
        <Dialog.Content
          onPointerDownOutside={(e) => !closeOnOutside && e.preventDefault()}
          onInteractOutside={(e) => !closeOnOutside && e.preventDefault()}
          className={cn(
            'modal-center pop-in z-[71] w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl focus:outline-none',
            className,
          )}
          aria-describedby={undefined}
        >
          {title ? (
            <Dialog.Title className="pr-8 text-lg font-bold tracking-tight">{title}</Dialog.Title>
          ) : (
            <Dialog.Title className="sr-only">Dialog</Dialog.Title>
          )}
          {description && <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description>}
          {!hideClose && (
            <Dialog.Close className="absolute right-4 top-4 rounded-md p-1 text-muted hover:bg-surface-2 hover:text-fg" aria-label={t('common.close')}>
              <X className="h-4 w-4" />
            </Dialog.Close>
          )}
          <div className={title ? 'mt-4' : ''}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/* ——— Drawer lateral derecho ——— */
export function Drawer({
  open,
  onOpenChange,
  title,
  children,
  className,
  side = 'right',
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title?: ReactNode
  children: ReactNode
  className?: string
  side?: 'right' | 'left'
}) {
  const t = useT()
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fade-in fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed bottom-0 top-0 z-[71] flex w-full max-w-[520px] flex-col border-border bg-surface shadow-2xl focus:outline-none',
            side === 'right' ? 'slide-in-right right-0 border-l' : 'slide-in-left left-0 border-r',
            className,
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title className="text-base font-bold tracking-tight">{title ?? ''}</Dialog.Title>
            <Dialog.Close className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-fg" aria-label={t('common.close')}>
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/* ——— Switch ——— */
export function Switch({
  checked,
  onCheckedChange,
  label,
  className,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  label?: string
  className?: string
}) {
  return (
    <SwitchPrim.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring',
        checked ? 'bg-accent' : 'bg-zinc-300 dark:bg-zinc-700',
        className,
      )}
    >
      <SwitchPrim.Thumb className="block h-4 w-4 rounded-full bg-white shadow transition-[translate] data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-0.5" />
    </SwitchPrim.Root>
  )
}

/* ——— Slider (simple o doble) ——— */
export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 10,
  step = 1,
  label,
  className,
}: {
  value: number[]
  onValueChange: (v: number[]) => void
  min?: number
  max?: number
  step?: number
  label?: string
  className?: string
}) {
  return (
    <SliderPrim.Root
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      className={cn('relative flex h-5 w-full touch-none select-none items-center', className)}
    >
      <SliderPrim.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <SliderPrim.Range className="absolute h-full bg-accent" />
      </SliderPrim.Track>
      {value.map((_, i) => (
        <SliderPrim.Thumb
          key={i}
          aria-label={label}
          className="block h-4 w-4 rounded-full border-2 border-accent bg-white shadow transition-shadow hover:ring-4 hover:ring-accent-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-ring dark:bg-zinc-900"
        />
      ))}
    </SliderPrim.Root>
  )
}

/* ——— Badges de estado ——— */
const TONE = {
  green: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400',
  red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400',
  gray: 'bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-400',
  accent: 'bg-accent-soft text-accent ring-accent/20',
} as const
export type Tone = keyof typeof TONE

export function Badge({ tone = 'gray', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn('chip ring-1 ring-inset', TONE[tone], className)}>{children}</span>
}

const STATUS_TONE: Record<MemberStatus, Tone> = { aprobado: 'green', pendiente: 'amber', incompleto: 'gray', rechazado: 'red', pausa: 'blue' }
export function StatusBadge({ status }: { status: MemberStatus }) {
  const { lang } = useLang()
  return <Badge tone={STATUS_TONE[status]}>{tx(ESTADOS, status, lang)}</Badge>
}
const PAGO_TONE: Record<Pago, Tone> = { ok: 'green', pendiente: 'amber', fallido: 'red', reembolsado: 'gray' }
export function PagoBadge({ pago }: { pago: Pago }) {
  const { lang } = useLang()
  return <Badge tone={PAGO_TONE[pago]}>{tx(PAGOS, pago, lang)}</Badge>
}
const TX_TONE: Record<TxEstado, Tone> = { aprobado: 'green', pendiente: 'amber', fallido: 'red', reembolsado: 'gray' }
export function TxBadge({ estado }: { estado: TxEstado }) {
  const { lang } = useLang()
  return <Badge tone={TX_TONE[estado]}>{tx(TX_ESTADOS, estado, lang)}</Badge>
}

/* ——— KPI card ——— */
export function Kpi({
  label,
  value,
  delta,
  deltaDown,
  hint,
  icon,
}: {
  label: string
  value: ReactNode
  delta?: string
  deltaDown?: boolean
  hint?: string
  icon?: ReactNode
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="label-xs">{label}</p>
        {icon && <span className="text-muted">{icon}</span>}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="num text-[30px] leading-none tracking-tight">{value}</span>
        {delta && (
          <span className={cn('chip mb-0.5 ring-1 ring-inset', deltaDown ? TONE.red : TONE.green)}>
            {deltaDown ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
            {delta}
          </span>
        )}
      </div>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  )
}

/* ——— Encabezado de página ——— */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  const { role } = useSession()
  const t = useT()
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="label-xs !text-accent">{t(ROLE_KICKER[role])}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted sm:text-[15px]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function CardHeader({ title, subtitle, right }: { title: ReactNode; subtitle?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-3.5">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function Empty({ icon, text }: { icon?: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted">
      {icon}
      {text}
    </div>
  )
}

/* ——— Tabs simples (pills) ——— */
export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T
  onChange: (v: T) => void
  items: { value: T; label: ReactNode; count?: number }[]
  className?: string
}) {
  return (
    <div className={cn('no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface-2 p-1', className)} role="tablist">
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          aria-selected={value === it.value}
          onClick={() => onChange(it.value)}
          className={cn(
            'flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors',
            value === it.value ? 'bg-surface text-fg shadow-card ring-1 ring-border' : 'text-muted hover:text-fg',
          )}
        >
          {it.label}
          {it.count != null && (
            <span className={cn('num rounded-full px-1.5 text-[11px]', value === it.value ? 'bg-accent text-white' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400')}>
              {it.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

/** Anillo circular de score (verde ≥80, ámbar 60-79, gris <60) */
export function ScoreRing({ score, size = 56, muted = false }: { score: number; size?: number; muted?: boolean }) {
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  const color = muted ? '#a1a1aa' : score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#a1a1aa'
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-zinc-200 dark:text-zinc-800" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          style={{ transition: 'stroke-dashoffset .5s ease, stroke .3s' }}
        />
      </svg>
      <span className="num absolute inset-0 flex items-center justify-center font-bold" style={{ fontSize: size * 0.32 }}>
        {score}
      </span>
    </div>
  )
}
