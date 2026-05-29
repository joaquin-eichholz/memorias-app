import { useState, useEffect, useCallback } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getIndex, createChapter, deleteChapter, reorderChapters } from '../utils/storage'

function SortableChapter({ chapter, isSelected, onSelect, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center rounded-xl px-3 py-3 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200'
          : 'hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
      }`}
      onClick={() => onSelect(chapter.id)}
    >
      <span
        {...attributes} {...listeners}
        className="mr-2 text-stone-300 dark:text-stone-600 cursor-grab active:cursor-grabbing touch-none"
        onClick={e => e.stopPropagation()}
      >⣿</span>
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-base">{chapter.title || chapter.name?.replace('.html','')}</p>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
          {new Date(chapter.updatedAt || chapter.modifiedTime).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
        </p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(chapter.id || chapter.driveId) }}
        className="ml-1 opacity-0 group-hover:opacity-100 p-1 rounded text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-opacity"
        title="Eliminar capítulo"
      >×</button>
    </div>
  )
}

export default function Sidebar({ selectedId, onSelect, onClose, drive }) {
  const [chapters, setChapters] = useState([])
  const [search, setSearch] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [driveError, setDriveError] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const reload = useCallback(async () => {
    if (drive?.connected) {
      try {
        const files = await drive.listFiles()
        setChapters(files.map(f => ({
          id: f.id,
          driveId: f.id,
          title: f.name.replace(/\.html?$/, ''),
          updatedAt: f.modifiedTime,
        })))
        setDriveError(null)
      } catch (e) {
        setDriveError('No se pudo cargar desde Drive.')
      }
    } else {
      setChapters(getIndex().chapters)
    }
  }, [drive?.connected])

  useEffect(() => {
    reload()
    if (!drive?.connected) {
      const onStorage = () => reload()
      window.addEventListener('storage', onStorage)
      return () => window.removeEventListener('storage', onStorage)
    }
  }, [reload])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    if (drive?.connected) {
      const file = await drive.createFile(`${newTitle.trim()}.html`, '')
      await reload()
      onSelect(file.id)
    } else {
      const id = createChapter(newTitle.trim())
      reload()
      onSelect(id)
    }
    setNewTitle('')
    setAdding(false)
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este capítulo? No se puede deshacer.')) return
    if (drive?.connected) {
      await drive.deleteFile(id)
    } else {
      deleteChapter(id)
    }
    reload()
    if (selectedId === id) onSelect(null)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = chapters.findIndex(c => c.id === active.id)
    const newIndex = chapters.findIndex(c => c.id === over.id)
    const reordered = arrayMove(chapters, oldIndex, newIndex)
    setChapters(reordered)
    if (!drive?.connected) reorderChapters(reordered.map(c => c.id))
  }

  const filtered = chapters.filter(c =>
    (c.title || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-4 border-b border-stone-200 dark:border-stone-700">
        <div>
          <h2 className="font-bold text-lg text-stone-800 dark:text-stone-100">Capítulos</h2>
          {drive?.connected && (
            <p className="text-xs text-green-600 dark:text-green-400">☁️ Google Drive</p>
          )}
        </div>
        <button onClick={onClose} className="lg:hidden p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">×</button>
      </div>

      <div className="px-3 py-3">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar capítulo…"
          className="w-full px-3 py-2 text-sm rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 placeholder:text-stone-400 border-none outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {driveError && (
        <p className="mx-3 text-sm text-red-500 dark:text-red-400">{driveError}</p>
      )}

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {filtered.length === 0 && !adding && (
          <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-8">
            {search ? 'Sin resultados.' : 'Aún no hay capítulos.\nCreá el primero.'}
          </p>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {filtered.map(chapter => (
              <SortableChapter
                key={chapter.id}
                chapter={chapter}
                isSelected={selectedId === chapter.id}
                onSelect={onSelect}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="px-3 pb-4 pt-2 border-t border-stone-200 dark:border-stone-700">
        {adding ? (
          <form onSubmit={handleCreate} className="space-y-2">
            <input
              autoFocus
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Nombre del capítulo"
              className="w-full px-3 py-2 text-sm rounded-lg border border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:bg-stone-700 dark:text-stone-100"
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors">Crear</button>
              <button type="button" onClick={() => { setAdding(false); setNewTitle('') }} className="flex-1 py-2 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-600 dark:text-stone-300 text-sm font-medium rounded-lg transition-colors">Cancelar</button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-base font-semibold transition-colors"
          >
            + Nuevo capítulo
          </button>
        )}
      </div>
    </div>
  )
}
