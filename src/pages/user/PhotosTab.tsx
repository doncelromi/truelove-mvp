import { useRef, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { GripVertical, ImagePlus, Lightbulb, Star, Trash2, Upload } from 'lucide-react'
import { PhotoTile } from '@/components/MemberPhoto'
import { DevNotice } from '@/components/Notices'
import type { Member, Photo } from '@/data/types'
import { useTr } from '@/lib/i18n'
import { MAX_PHOTOS, useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

function SortablePhoto({ member, photo, onCover, onRemove }: { member: Member; photo: Photo; onCover: () => void; onRemove: () => void }) {
  const tr = useTr()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('group relative aspect-[4/5] overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10', isDragging && 'z-10 opacity-80 shadow-xl', photo.esPortada && 'ring-2 ring-accent')}
    >
      <PhotoTile member={member} photo={photo} />
      <button {...attributes} {...listeners} className="absolute left-1.5 top-1.5 flex h-8 w-8 cursor-grab touch-none items-center justify-center rounded-lg bg-black/45 text-white backdrop-blur active:cursor-grabbing" aria-label={tr('Arrastrar para ordenar', 'Drag to reorder')}>
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1">
        <button onClick={onCover} className={cn('chip h-8 px-2.5 backdrop-blur', photo.esPortada ? 'bg-accent text-white' : 'bg-black/45 text-white hover:bg-black/60')}>
          <Star className={cn('h-3.5 w-3.5', photo.esPortada && 'fill-current')} /> {photo.esPortada ? tr('Portada', 'Cover') : tr('Hacer portada', 'Set as cover')}
        </button>
        <button onClick={onRemove} className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/45 text-white backdrop-blur hover:bg-red-600" aria-label={tr('Eliminar', 'Delete')}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function PhotosTab({ member }: { member: Member }) {
  const tr = useTr()
  const { addPhotos, setCover, removePhoto, reorderPhotos } = useStore()
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const photos = [...member.fotos].sort((a, b) => a.orden - b.orden)
  const full = photos.length >= MAX_PHOTOS
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }))

  const handleFiles = (list: FileList | null) => {
    if (!list?.length) return
    if (full) {
      toast.error(tr('Llegaste al máximo de 6 fotos. Eliminá alguna para subir otra.', 'You reached the 6-photo limit. Delete one to upload another.'))
      return
    }
    const n = addPhotos(member.id, Array.from(list))
    if (n === 0) toast.error(tr('Formato no válido. Usá JPG, PNG o WEBP.', 'Invalid format. Use JPG, PNG or WEBP.'))
    else toast.success(tr(`${n} foto${n > 1 ? 's' : ''} subida${n > 1 ? 's' : ''}`, `${n} photo${n > 1 ? 's' : ''} uploaded`))
    if (list.length > n && n > 0) toast(tr('Algunas fotos no entraron: máximo 6.', 'Some photos didn’t fit: max 6.'))
  }

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return
    const ids = photos.map((p) => p.id)
    reorderPhotos(member.id, arrayMove(ids, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id))))
  }

  return (
    <div data-trailer="photo-gallery">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">{tr('Mis fotos', 'My photos')}</h3>
          <p className="text-sm text-muted">{tr('La portada es la que ven primero tus parejas sugeridas.', 'Your cover is what your suggested matches see first.')}</p>
        </div>
        <span className="num rounded-full bg-accent-soft px-3 py-1 text-sm text-accent">{photos.length}/{MAX_PHOTOS}</span>
      </div>

      <label
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); handleFiles(e.dataTransfer.files) }}
        className={cn('mt-4 flex min-h-[132px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors', over ? 'border-accent bg-accent-soft' : 'border-border hover:border-accent/60 hover:bg-surface-2', full && 'opacity-60')}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent"><Upload className="h-5 w-5" /></span>
        <span className="font-medium">{tr('Arrastrá tus fotos o hacé clic', 'Drag your photos or click')}</span>
        <span className="text-xs text-muted">{tr('JPG, PNG o WEBP · hasta 6 fotos', 'JPG, PNG or WEBP · up to 6 photos')}</span>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }} data-trailer="photo-input" />
      </label>
      <button className="btn-primary mt-3 w-full sm:w-auto" onClick={() => input.current?.click()} disabled={full}>
        <ImagePlus className="h-4 w-4" /> {tr('Subir fotos', 'Upload photos')}
      </button>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((p) => (
              <SortablePhoto
                key={p.id}
                member={member}
                photo={p}
                onCover={() => { setCover(member.id, p.id); toast.success(tr('Portada actualizada en toda la plataforma', 'Cover updated across the platform')) }}
                onRemove={() => { removePhoto(member.id, p.id); toast(tr('Foto eliminada', 'Photo deleted')) }}
              />
            ))}
            {Array.from({ length: Math.max(0, MAX_PHOTOS - photos.length) }).map((_, i) => (
              <button key={i} onClick={() => input.current?.click()} className="flex aspect-[4/5] items-center justify-center rounded-xl border border-dashed border-border text-muted hover:border-accent hover:text-accent">
                <ImagePlus className="h-6 w-6" />
              </button>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-5 flex gap-3 rounded-xl bg-surface-2 p-4 text-sm">
        <Lightbulb className="h-5 w-5 shrink-0 text-accent" />
        <div>
          <p className="font-medium">{tr('Consejos', 'Tips')}</p>
          <p className="text-muted">{tr('Fotos recientes, con buena luz, sin filtros. Que se vea tu cara en la portada y sumá alguna haciendo lo que te gusta.', 'Recent photos, good lighting, no filters. Show your face on the cover and add one doing what you love.')}</p>
        </div>
      </div>
      <DevNotice
        className="mt-4"
        title={tr('Almacenamiento de fotos', 'Photo storage')}
        now={tr('Hoy las fotos viven solo en esta sesión;', 'Today photos live only in this session;')}
        later={tr('al desarrollar se guardan de forma segura en el servidor.', 'once built they’re stored securely on the server.')}
      />
    </div>
  )
}
