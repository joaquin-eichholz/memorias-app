export default function DriveModal({ drive, onClose }) {
  const hasClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

  function handleConnect() {
    drive.connect()
    onClose()
  }

  function handleDisconnect() {
    drive.disconnect()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white dark:bg-stone-800 rounded-3xl shadow-2xl p-8 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {drive.connected ? (
          <>
            <div className="text-center space-y-2">
              <div className="text-5xl">☁️</div>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Drive conectado</h2>
              <p className="text-stone-500 dark:text-stone-400">
                Tus capítulos se guardan automáticamente en tu Google Drive.
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-2xl p-4 text-green-700 dark:text-green-300 text-sm">
              ✓ Todos los cambios se sincronizan en la nube
            </div>
            <div className="space-y-3">
              <button
                onClick={handleDisconnect}
                className="w-full py-3 rounded-2xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
              >
                Desconectar Drive
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center space-y-2">
              <div className="text-5xl">☁️</div>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Conectar Google Drive</h2>
              <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
                Guardá tus memorias en la nube y accedé desde cualquier dispositivo.
              </p>
            </div>

            <ul className="space-y-2 text-stone-600 dark:text-stone-400 text-sm">
              <li className="flex gap-2"><span>✓</span><span>Guardado automático en tu Drive</span></li>
              <li className="flex gap-2"><span>✓</span><span>Solo vos podés ver los archivos</span></li>
              <li className="flex gap-2"><span>✓</span><span>Acceso desde tablet, celular o PC</span></li>
            </ul>

            {hasClientId ? (
              <button
                onClick={handleConnect}
                className="w-full py-4 bg-white dark:bg-stone-700 border-2 border-stone-300 dark:border-stone-500 hover:border-amber-400 text-stone-700 dark:text-stone-200 text-lg font-semibold rounded-2xl transition-colors flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Conectar con Google
              </button>
            ) : (
              <div className="bg-amber-50 dark:bg-stone-700 rounded-2xl p-4 space-y-2 text-sm text-stone-600 dark:text-stone-300">
                <p className="font-semibold">Para activar Drive:</p>
                <p>Agregá en StackBlitz → Settings → Environment Variables:</p>
                <code className="block bg-stone-200 dark:bg-stone-600 px-3 py-2 rounded-xl text-xs break-all">
                  VITE_GOOGLE_CLIENT_ID=tu-client-id
                </code>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm transition-colors"
            >
              Ahora no
            </button>
          </>
        )}
      </div>
    </div>
  )
}
