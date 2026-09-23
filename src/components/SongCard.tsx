import type { ReactNode } from 'react'
import { ExternalLink, Music, Star } from 'lucide-react'
import type { Song } from '@/data/types'
import { useLang, useTr } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function listenUrl(s: Pick<Song, 'titulo' | 'artista' | 'link'>) {
  return s.link || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${s.titulo} ${s.artista}`)}`
}

/** Solo título + artista + frase personal. Sin letras ni portadas. */
export function SongCard({ song, actions, compact = false, className }: { song: Song; actions?: ReactNode; compact?: boolean; className?: string }) {
  const { lang } = useLang()
  const tr = useTr()
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border border-border bg-surface p-3', song.esCancionIdeal && 'border-accent/40 bg-accent-soft/40', className)}>
      <div className={cn('flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[#d9507a] text-white', compact ? 'h-9 w-9' : 'h-11 w-11')}>
        <Music className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="truncate text-sm font-semibold">{song.titulo}</p>
          {song.esCancionIdeal && (
            <span className="chip bg-accent px-2 text-[10px] font-semibold text-white">
              <Star className="h-2.5 w-2.5 fill-current" /> {tr('Nuestra canción ideal', 'Our ideal song')}
            </span>
          )}
        </div>
        <p className="text-xs text-muted">{song.artista}</p>
        {!compact && song.porQue[lang] && <p className="mt-1.5 text-[13px] italic text-fg/80">“{song.porQue[lang]}”</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <a href={listenUrl(song)} target="_blank" rel="noopener" className="btn-outline btn-sm h-7 px-2 text-[11px]">
          <ExternalLink className="h-3 w-3" /> {tr('Escuchar', 'Listen')}
        </a>
        {actions}
      </div>
    </div>
  )
}
