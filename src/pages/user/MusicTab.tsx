import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { GripVertical, Music, Plus, Star, Trash2 } from 'lucide-react'
import { SongCard } from '@/components/SongCard'
import { Empty, Modal } from '@/components/ui'
import type { Member, Song } from '@/data/types'
import { useTr } from '@/lib/i18n'
import { MAX_SONGS, useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

function SortableSong({ song, onIdeal, onRemove }: { song: Song; onIdeal: () => void; onRemove: () => void }) {
  const tr = useTr()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: song.id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn('flex items-center gap-2', isDragging && 'z-10 opacity-80')}>
      <button {...attributes} {...listeners} className="flex h-9 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted hover:bg-surface-2" aria-label={tr('Arrastrar para ordenar', 'Drag to reorder')}>
        <GripVertical className="h-4 w-4" />
      </button>
      <SongCard
        song={song}
        className="min-w-0 flex-1"
        actions={
          <>
            <button onClick={onIdeal} title={tr('Marcar como nuestra canción ideal', 'Mark as our ideal song')} className={cn('flex h-7 w-7 items-center justify-center rounded-md', song.esCancionIdeal ? 'text-accent' : 'text-muted hover:bg-surface-2')}>
              <Star className={cn('h-3.5 w-3.5', song.esCancionIdeal && 'fill-current')} />
            </button>
            <button onClick={onRemove} title={tr('Eliminar', 'Delete')} className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        }
      />
    </div>
  )
}

export default function MusicTab({ member }: { member: Member }) {
  const tr = useTr()
  const { addSong, removeSong, reorderSongs, setIdealSong } = useStore()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ titulo: '', artista: '', link: '', porQue: '' })
  const songs = [...member.canciones].sort((a, b) => a.orden - b.orden)
  const full = songs.length >= MAX_SONGS
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }))

  const save = () => {
    addSong(member.id, { titulo: f.titulo.trim(), artista: f.artista.trim(), link: f.link.trim() || undefined, porQue: { es: f.porQue.trim(), en: f.porQue.trim() } })
    toast.success(tr(`“${f.titulo}” agregada a tus canciones`, `“${f.titulo}” added to your songs`))
    setF({ titulo: '', artista: '', link: '', porQue: '' })
    setOpen(false)
  }
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return
    const ids = songs.map((s) => s.id)
    reorderSongs(member.id, arrayMove(ids, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id))))
  }

  return (
    <div data-trailer="song-list">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">{tr('Canciones que me representan', 'Songs that represent me')}</h3>
          <p className="text-sm text-muted">{tr('La música en común es una señal de afinidad para el motor.', 'Shared music is an affinity signal for the engine.')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="num rounded-full bg-accent-soft px-3 py-1 text-sm text-accent">{songs.length}/{MAX_SONGS}</span>
          <button className="btn-primary" onClick={() => (full ? toast.error(tr('Máximo 5 canciones. Eliminá una para sumar otra.', 'Max 5 songs. Delete one to add another.')) : setOpen(true))} data-trailer="add-song">
            <Plus className="h-4 w-4" /> {tr('Agregar canción', 'Add song')}
          </button>
        </div>
      </div>

      <div className="mt-4">
        {songs.length === 0 ? (
          <Empty icon={<Music className="h-6 w-6" />} text={tr('Todavía no agregaste canciones. ¿Cuál te representa?', 'No songs yet. Which one represents you?')} />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={songs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {songs.map((s) => (
                  <SortableSong
                    key={s.id}
                    song={s}
                    onIdeal={() => { setIdealSong(member.id, s.id); toast.success(tr(`“${s.titulo}” es tu canción ideal`, `“${s.titulo}” is your ideal song`)) }}
                    onRemove={() => { removeSong(member.id, s.id); toast(tr('Canción eliminada', 'Song deleted')) }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
      <p className="mt-3 text-xs text-muted">{tr('Tocá la estrella para marcar “Nuestra canción ideal”. Arrastrá para ordenar.', 'Tap the star to mark “Our ideal song”. Drag to reorder.')}</p>

      <Modal open={open} onOpenChange={setOpen} title={tr('Agregar canción', 'Add song')} description={tr('Solo título, artista y por qué la elegiste.', 'Just title, artist and why you chose it.')}>
        <div className="space-y-3">
          <label className="block"><span className="mb-1 block text-sm font-medium">{tr('Título', 'Title')}</span><input className="input" value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} placeholder={tr('Ej.: Amar la trama', 'e.g. Amar la trama')} /></label>
          <label className="block"><span className="mb-1 block text-sm font-medium">{tr('Artista', 'Artist')}</span><input className="input" value={f.artista} onChange={(e) => setF({ ...f, artista: e.target.value })} placeholder={tr('Ej.: Jorge Drexler', 'e.g. Jorge Drexler')} /></label>
          <label className="block"><span className="mb-1 block text-sm font-medium">{tr('Link de Spotify o YouTube (opcional)', 'Spotify or YouTube link (optional)')}</span><input className="input" value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} placeholder="https://" /></label>
          <label className="block"><span className="mb-1 block text-sm font-medium">{tr('¿Por qué la elegiste?', 'Why did you choose it?')}</span><textarea className="input h-20 py-2" value={f.porQue} onChange={(e) => setF({ ...f, porQue: e.target.value })} placeholder={tr('Una frase que la explique…', 'One sentence that explains it…')} /></label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-outline" onClick={() => setOpen(false)}>{tr('Cancelar', 'Cancel')}</button>
          <button className="btn-primary" disabled={!f.titulo.trim() || !f.artista.trim()} onClick={save}>{tr('Agregar', 'Add')}</button>
        </div>
      </Modal>
    </div>
  )
}
