import { useState } from 'react'
import Sidebar from './Sidebar'
import Editor from './Editor'
import AiChat from './AiChat'
import { logout } from '../utils/auth'

export default function Layout({ onLogout, drive }) {
  const [selectedChapterId, setSelectedChapterId] = useState(null)
  const [editorContent, setEditorContent] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(18)

  function handleLogout() {
    logout()
    onLogout()
  }

  function toggleDark() {
    setDarkMode(d => {
      const next = !d
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  return (
    <div className={`flex h-screen overflow-hidden bg-stone-100 dark:bg-stone-900`} style={{ fontSize }}>

      {/* Overlay para cerrar sidebar en mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 flex-shrink-0 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar
          selectedId={selectedChapterId}
          onSelect={(id) => { setSelectedChapterId(id); setSidebarOpen(false) }}
          onClose={() => setSidebarOpen(false)}
          drive={drive}
        />
      </aside>

      {/* Columna principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex-shrink-0">
          {/* Botón hamburguesa — solo visible en mobile/tablet */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <span className="text-lg font-semibold text-stone-700 dark:text-stone-200 flex-1 hidden sm:block">
            Mis Memorias
          </span>

          <div className="flex items-center gap-2 ml-auto">
            {/* Tamaño de fuente */}
            <button
              onClick={() => setFontSize(s => Math.max(14, s - 2))}
              className="px-2 py-1 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 rounded"
              title="Letra más pequeña"
            >A-</button>
            <button
              onClick={() => setFontSize(s => Math.min(28, s + 2))}
              className="px-2 py-1 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 rounded"
              title="Letra más grande"
            >A+</button>

            {/* Drive status */}
            {drive && (
              <button
                onClick={drive.connected ? drive.disconnect : drive.connect}
                className={`p-2 rounded-lg transition-colors text-sm ${
                  drive.connected
                    ? 'text-green-600 dark:text-green-400 hover:bg-stone-100 dark:hover:bg-stone-700'
                    : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
                title={drive.connected ? 'Drive conectado — click para desconectar' : 'Conectar Google Drive'}
              >
                {drive.connected ? '☁️' : '○ Drive'}
              </button>
            )}

            {/* Dark mode */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400"
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Chat IA */}
            <button
              onClick={() => setChatOpen(o => !o)}
              className={`p-2 rounded-lg transition-colors text-stone-500 dark:text-stone-400 ${chatOpen ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' : 'hover:bg-stone-100 dark:hover:bg-stone-700'}`}
              title="Asistente de escritura"
            >
              ✨
            </button>

            {/* Salir */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400"
              title="Salir"
            >
              🚪
            </button>
          </div>
        </header>

        {/* Editor + Chat */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto">
            <Editor
              chapterId={selectedChapterId}
              onContentChange={setEditorContent}
              drive={drive}
            />
          </main>

          {/* Panel de chat — desktop: columna lateral. mobile: modal */}
          {chatOpen && (
            <>
              {/* Desktop */}
              <aside className="hidden md:flex w-80 xl:w-96 flex-shrink-0 border-l border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 overflow-hidden">
                <AiChat editorContent={editorContent} />
              </aside>

              {/* Mobile: modal desde abajo */}
              <div className="fixed inset-x-0 bottom-0 z-40 md:hidden bg-white dark:bg-stone-800 rounded-t-2xl shadow-xl border-t border-stone-200 dark:border-stone-700" style={{ height: '70vh' }}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-700">
                  <span className="font-semibold text-stone-700 dark:text-stone-200">✨ Asistente</span>
                  <button onClick={() => setChatOpen(false)} className="text-stone-400 text-2xl leading-none">×</button>
                </div>
                <div className="h-full pb-14 overflow-hidden">
                  <AiChat editorContent={editorContent} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
