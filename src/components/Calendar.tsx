import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns'
import { MapPin, Video } from 'lucide-react'
import type { Interview } from '@/data/types'
import { psicoById } from '@/data/members'
import { dateLocale, useLang, useTr } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export const HOURS = Array.from({ length: 11 }, (_, i) => 9 + i) // 9..19

export type ColorMode = 'psico' | 'estado'
const ESTADO_COLOR: Record<Interview['estado'], string> = { agendada: '#2563eb', realizada: '#16a34a', cancelada: '#dc2626' }
export const ivColor = (iv: Interview, mode: ColorMode) =>
  mode === 'psico' ? psicoById(iv.psicologaId).color : iv.resultado === 'en espera' ? '#d97706' : ESTADO_COLOR[iv.estado]

export function WeekCalendar({
  anchor,
  interviews,
  onSelect,
  colorMode,
  freeSlots = false,
  onFreeSlot,
}: {
  anchor: Date
  interviews: Interview[]
  onSelect: (iv: Interview) => void
  colorMode: ColorMode
  freeSlots?: boolean
  onFreeSlot?: (d: Date) => void
}) {
  const { lang } = useLang()
  const { byId } = useStore()
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  const days = Array.from({ length: 6 }, (_, i) => addDays(start, i)) // lunes a sábado
  const today = new Date()
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[760px] grid-cols-[56px_repeat(6,1fr)]">
        <div />
        {days.map((d) => (
          <div key={d.toISOString()} className={cn('border-b border-border px-2 pb-2 text-center', isSameDay(d, today) && 'text-accent')}>
            <p className="label-xs !text-inherit">{format(d, 'EEE', { locale: dateLocale(lang) })}</p>
            <p className={cn('num mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm', isSameDay(d, today) && 'bg-accent text-white')}>{format(d, 'd')}</p>
          </div>
        ))}
        {HOURS.map((h) => (
          <div key={h} className="contents">
            <div className="num border-r border-border pr-2 pt-1 text-right text-[11px] text-muted">{String(h).padStart(2, '0')}:00</div>
            {days.map((d) => {
              const slot = interviews.filter((iv) => {
                const f = new Date(iv.fecha)
                return isSameDay(f, d) && f.getHours() === h
              })
              const isFree = freeSlots && slot.length === 0 && d.getDay() !== 6 && (h + d.getDate()) % 3 === 0
              return (
                <div key={d.toISOString() + h} className="min-h-[52px] border-b border-r border-border p-1">
                  {slot.map((iv) => {
                    const m = byId(iv.memberId)
                    const c = ivColor(iv, colorMode)
                    return (
                      <button
                        key={iv.id}
                        onClick={() => onSelect(iv)}
                        className={cn('mb-1 w-full rounded-md border-l-[3px] px-1.5 py-1 text-left text-[11px] leading-tight transition-colors hover:brightness-95', iv.estado === 'cancelada' && 'line-through opacity-60')}
                        style={{ borderColor: c, background: `${c}14` }}
                      >
                        <span className="block truncate font-semibold">{m ? `${m.nombre} ${m.apellido}` : '—'}</span>
                        <span className="flex items-center gap-1 text-muted">
                          {iv.modalidad === 'zoom' ? <Video className="h-2.5 w-2.5" /> : <MapPin className="h-2.5 w-2.5" />}
                          {format(new Date(iv.fecha), 'HH:mm')}
                        </span>
                      </button>
                    )
                  })}
                  {isFree && (
                    <button
                      onClick={() => onFreeSlot?.(new Date(d.getFullYear(), d.getMonth(), d.getDate(), h))}
                      className="h-full min-h-[40px] w-full rounded-md border border-dashed border-zinc-300 text-[10px] text-muted hover:border-accent hover:text-accent dark:border-zinc-700"
                    >
                      {lang === 'es' ? 'Libre' : 'Free'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function MonthCalendar({
  anchor,
  interviews,
  onSelect,
  colorMode,
}: {
  anchor: Date
  interviews: Interview[]
  onSelect: (iv: Interview) => void
  colorMode: ColorMode
}) {
  const { lang } = useLang()
  const tr = useTr()
  const { byId } = useStore()
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 })
  const days: Date[] = []
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d)
  const today = new Date()
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[680px] grid-cols-7">
        {days.slice(0, 7).map((d) => (
          <p key={d.toISOString()} className="label-xs border-b border-border pb-2 text-center">{format(d, 'EEE', { locale: dateLocale(lang) })}</p>
        ))}
        {days.map((d) => {
          const list = interviews.filter((iv) => isSameDay(new Date(iv.fecha), d)).sort((a, b) => a.fecha.localeCompare(b.fecha))
          return (
            <div key={d.toISOString()} className={cn('min-h-[92px] border-b border-r border-border p-1.5', !isSameMonth(d, anchor) && 'bg-surface-2/60 text-muted')}>
              <p className={cn('num mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs', isSameDay(d, today) && 'bg-accent text-white')}>{format(d, 'd')}</p>
              {list.slice(0, 3).map((iv) => {
                const m = byId(iv.memberId)
                const c = ivColor(iv, colorMode)
                return (
                  <button key={iv.id} onClick={() => onSelect(iv)} className={cn('mb-0.5 flex w-full items-center gap-1 truncate rounded px-1 text-left text-[10.5px] hover:bg-surface-2', iv.estado === 'cancelada' && 'line-through opacity-60')}>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: c }} />
                    <span className="num">{format(new Date(iv.fecha), 'HH:mm')}</span>
                    <span className="truncate">{m?.nombre}</span>
                  </button>
                )
              })}
              {list.length > 3 && <p className="px-1 text-[10px] text-muted">+{list.length - 3} {tr('más', 'more')}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
