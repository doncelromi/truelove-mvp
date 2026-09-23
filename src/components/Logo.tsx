import { cn } from '@/lib/utils'

/** Dos alianzas entrelazadas, trazo en el acento */
export function RingsIcon({ className, strokeWidth = 1.8 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 32 24" fill="none" className={cn('h-5 w-6 text-accent', className)} aria-hidden>
      <circle cx="12" cy="13" r="7.5" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="20" cy="13" r="7.5" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M18.2 3.2 20 1.2l1.8 2" stroke="currentColor" strokeWidth={strokeWidth * 0.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft">
        <RingsIcon className="h-4 w-5" strokeWidth={2.2} />
      </span>
      {!compact && <span className="text-[15px] font-semibold tracking-tight">Agencia True Love</span>}
    </div>
  )
}
