import { useState } from 'react'
import { createPassword } from '../utils/auth'

const STEPS = ['bienvenida', 'contraseña', 'drive']

export default function Onboarding({ onComplete, drive }) {
  const [step, setStep] = useState(0)
  const [pwd, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setError('')
    if (pwd.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (pwd !== confirm) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    await createPassword(pwd)
    setLoading(false)
    setStep(2)
  }

  const hasClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-stone-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Indicador de pasos */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full transition-colors ${
                i < step ? 'bg-amber-500' : i === step ? 'bg-amber-600' : 'bg-amber-200 dark:bg-stone-600'
              }`} />
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? 'bg-amber-500' : 'bg-amber-200 dark:bg-stone-600'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Paso 1 — Bienvenida */}
        {step === 0 && (
          <div className="text-center space-y-6">
            <div className="text-6xl">📖</div>
            <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">
              Bienvenida a<br />Mis Memorias
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
              Este es tu espacio privado para escribir tus recuerdos y vivencias.
              Solo vos podés entrar.
            </p>
            <button
              onClick={() => setStep(1)}
              className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white text-xl font-semibold rounded-2xl transition-colors"
            >
              Empezar
            </button>
          </div>
        )}

        {/* Paso 2 — Contraseña */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Elegí tu contraseña</h2>
              <p className="text-stone-600 dark:text-stone-400 mt-2">
                Esta contraseña protege tu app. Anotala en un lugar seguro.
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-2">Nueva contraseña</label>
                <input
                  type="password"
                  value={pwd}
                  onChange={e => setPwd(e.target.value)}
                  className="w-full text-xl p-4 border-2 border-stone-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-800 dark:text-stone-100 focus:border-amber-500 focus:outline-none"
                  placeholder="Mínimo 6 caracteres"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-2">Repetí la contraseña</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="w-full text-xl p-4 border-2 border-stone-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-800 dark:text-stone-100 focus:border-amber-500 focus:outline-none"
                  placeholder="Repetí la contraseña"
                />
              </div>
              {error && <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xl font-semibold rounded-2xl transition-colors"
              >
                {loading ? 'Guardando…' : 'Continuar'}
              </button>
            </form>
          </div>
        )}

        {/* Paso 3 — Google Drive */}
        {step === 2 && (
          <div className="text-center space-y-6">
            <div className="text-5xl">☁️</div>
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Guardar en Google Drive</h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Conectá tu cuenta de Google para guardar tus escritos en la nube y acceder desde cualquier dispositivo.
            </p>

            {drive.connected ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-2xl p-4 text-green-700 dark:text-green-300 font-medium">
                  ✓ Google Drive conectado
                </div>
                <button
                  onClick={onComplete}
                  className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white text-xl font-semibold rounded-2xl transition-colors"
                >
                  Empezar a escribir →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {hasClientId ? (
                  <button
                    onClick={drive.connect}
                    className="w-full py-4 bg-white dark:bg-stone-700 border-2 border-stone-300 dark:border-stone-500 hover:border-amber-400 text-stone-700 dark:text-stone-200 text-xl font-semibold rounded-2xl transition-colors flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Conectar con Google
                  </button>
                ) : (
                  <div className="bg-amber-100 dark:bg-stone-800 rounded-2xl p-4 text-stone-600 dark:text-stone-400 text-sm text-left space-y-2">
                    <p className="font-medium">Para conectar Drive necesitás agregar tu Client ID:</p>
                    <p>En StackBlitz: <strong>Settings → Environment Variables</strong></p>
                    <code className="block bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded text-xs">VITE_GOOGLE_CLIENT_ID=tu-client-id</code>
                  </div>
                )}
                <button
                  onClick={onComplete}
                  className="w-full py-3 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-base transition-colors"
                >
                  Ahora no, guardar solo en este dispositivo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
