import { Camera } from 'lucide-react'
import type { Member, Photo } from '@/data/types'
import { coverOf } from '@/lib/store'
import { cn, initials } from '@/lib/utils'

// Gradientes suaves del acento y neutros (sin fotos de personas reales ni generadas)
const GRADIENTS = [
  'linear-gradient(135deg,#fdf2f5 0%,#f5d0dc 100%)',
  'linear-gradient(135deg,#f4f4f5 0%,#e4d4da 100%)',
  'linear-gradient(135deg,#fbeef2 0%,#e9c3cf 100%)',
  'linear-gradient(135deg,#f5f0ee 0%,#e7d7d0 100%)',
  'linear-gradient(135deg,#f3eef5 0%,#dccde3 100%)',
  'linear-gradient(135deg,#faf5f0 0%,#ecdcc9 100%)',
]
const DARK_GRADIENTS = [
  'linear-gradient(135deg,#2a1219 0%,#4a1d2c 100%)',
  'linear-gradient(135deg,#1f1f23 0%,#3a2a30 100%)',
  'linear-gradient(135deg,#2b151c 0%,#50263a 100%)',
  'linear-gradient(135deg,#221c1a 0%,#3d2f2a 100%)',
  'linear-gradient(135deg,#221a26 0%,#3a2c40 100%)',
  'linear-gradient(135deg,#24201b 0%,#403424 100%)',
]

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'card'
const SIZES: Record<Size, string> = {
  xs: 'h-7 w-7 text-[10px] rounded-full',
  sm: 'h-9 w-9 text-xs rounded-full',
  md: 'h-12 w-12 text-sm rounded-xl',
  lg: 'h-20 w-20 text-xl rounded-2xl',
  xl: 'h-32 w-32 text-3xl rounded-2xl',
  card: 'w-full aspect-[4/5] text-4xl rounded-xl',
}

export function PhotoPlaceholder({
  seed,
  label,
  className,
  showCamera = true,
}: {
  seed: string
  label: string
  className?: string
  showCamera?: boolean
}) {
  const i = hash(seed) % GRADIENTS.length
  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden select-none', className)}>
      <div className="absolute inset-0 dark:hidden" style={{ background: GRADIENTS[i] }} />
      <div className="absolute inset-0 hidden dark:block" style={{ background: DARK_GRADIENTS[i] }} />
      <span className="relative font-semibold tracking-wide text-accent/80">{label}</span>
      {showCamera && (
        <Camera className="absolute bottom-[8%] right-[8%] h-[18%] max-h-4 w-[18%] max-w-4 min-h-2.5 min-w-2.5 text-accent/50" />
      )}
    </div>
  )
}

export function PhotoTile({ member, photo, className }: { member: Member; photo: Photo; className?: string }) {
  if (photo.url)
    return <img src={photo.url} alt="" className={cn('h-full w-full object-cover', className)} draggable={false} />
  return (
    <PhotoPlaceholder
      seed={photo.id}
      label={initials(member.nombre, member.apellido)}
      className={cn('h-full w-full', className)}
    />
  )
}

export function MemberPhoto({
  member,
  size = 'md',
  className,
}: {
  member: Member
  size?: Size
  className?: string
}) {
  const cover = coverOf(member)
  const cls = cn(SIZES[size], 'shrink-0 overflow-hidden ring-1 ring-black/5 dark:ring-white/10', className)
  if (cover?.url) return <img src={cover.url} alt={member.nombre} className={cn(cls, 'object-cover')} />
  return (
    <PhotoPlaceholder
      seed={member.id}
      label={initials(member.nombre, member.apellido)}
      className={cls}
      showCamera={size !== 'xs'}
    />
  )
}
