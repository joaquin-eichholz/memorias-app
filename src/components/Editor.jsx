import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Typography from '@tiptap/extension-typography'
import { getChapter, saveChapter, updateChapterTitle } from '../utils/storage'

const DEBOUNCE_MS = 2000

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-amber-600 text-white'
          : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
      }`}
    >
      {children}
    </button>
  )
}

export default function Editor({ chapterId, onContentChange, drive }) {
  const [title, setTitle] = useState('')
  const [saveStatus, setSaveStatus] = useState('saved')
  const saveTimer = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Empezá a escribir tu recuerdo…' }),
      CharacterCount,
      Typography,
    ],
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-stone dark:prose-invert max-w-none p-8 min-h-full focus:outline-none',
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML()
      if (onContentChange) onContentChange(html)
      setSaveStatus('unsaved')
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        if (!chapterId) return
        setSaveStatus('saving')
        try {
          if (drive?.connected) {
            await drive.updateFile(chapterId, html)
          } else {
            saveChapter(chapterId, html)
          }
          setSaveStatus('saved')
        } catch {
          setSaveStatus('unsaved')
        }
      }, DEBOUNCE_MS)
    },
  })

  useEffect(() => {
    if (!editor) return
    if (!chapterId) { editor.commands.clearContent(); setTitle(''); return }

    async function load() {
      setSaveStatus('saved')
      if (drive?.connected) {
        try {
          const content = await drive.readFile(chapterId)
          editor.commands.setContent(content || '')
          // El título viene del Sidebar (nombre del archivo sin extensión)
        } catch {
          editor.commands.setContent('')
        }
      } else {
        const data = getChapter(chapterId)
        const { chapters } = JSON.parse(localStorage.getItem('memorias_index') || '{"chapters":[]}')
        const meta = chapters.find(c => c.id === chapterId)
        if (meta) setTitle(meta.title)
        editor.commands.setContent(data?.content || '')
      }
    }
    load()
  }, [chapterId, editor, drive?.connected])

  const handleTitleBlur = useCallback(() => {
    if (!drive?.connected && chapterId && title.trim()) {
      updateChapterTitle(chapterId, title.trim())
    }
  }, [chapterId, title, drive?.connected])

  const wordCount = editor?.storage?.characterCount?.words() ?? 0

  function exportTxt() {
    if (!editor) return
    const text = editor.getText()
    const blob = new Blob([`${title}\n\n${text}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${title || 'capitulo'}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  if (!chapterId) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div className="space-y-3">
          <div className="text-5xl">📝</div>
          <p className="text-xl text-stone-400 dark:text-stone-500">
            Seleccioná un capítulo para empezar a escribir<br />
            o creá uno nuevo desde el menú lateral.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-stone-900">
      <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })} title="Título grande">H1</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="Título mediano">H2</ToolbarButton>
        <div className="w-px h-6 bg-stone-200 dark:bg-stone-600 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Negrita"><strong>N</strong></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Cursiva"><em>C</em></ToolbarButton>
        <div className="w-px h-6 bg-stone-200 dark:bg-stone-600 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Lista">≡</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Cita">"</ToolbarButton>
        <div className="flex-1" />
        <div className="flex items-center gap-3 text-sm text-stone-400 dark:text-stone-500">
          <span>{wordCount} palabras</span>
          <span className={`flex items-center gap-1 ${
            saveStatus === 'saved' ? 'text-green-600 dark:text-green-400' :
            saveStatus === 'saving' ? 'text-amber-500' : 'text-stone-400'
          }`}>
            {saveStatus === 'saved' && `✓ Guardado${drive?.connected ? ' en Drive' : ''}`}
            {saveStatus === 'saving' && '⟳ Guardando…'}
            {saveStatus === 'unsaved' && '● Sin guardar'}
          </span>
          <button onClick={exportTxt} className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors" title="Exportar .txt">↓ .txt</button>
          <button onClick={() => window.print()} className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors" title="Imprimir / PDF">↓ PDF</button>
        </div>
      </div>

      {!drive?.connected && (
        <div className="px-8 pt-8 pb-2">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Título del capítulo"
            className="w-full text-3xl font-bold text-stone-800 dark:text-stone-100 bg-transparent border-none outline-none placeholder:text-stone-300 dark:placeholder:text-stone-600"
          />
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}
