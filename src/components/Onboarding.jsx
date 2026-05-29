import { useState } from 'react'
import { createPassword } from '../utils/auth'

const STEPS = ['bienvenida', 'contraseña', 'drive']

export default function Onboarding({ onComplete }) {
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

  function handleDriveSkip() {
    onComplete()
  }

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
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-2">
                  Nueva contraseña
                </label>
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
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-2">
                  Repetí la contraseña
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="w-full text-xl p-4 border-2 border-stone-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-800 dark:text-stone-100 focus:border-amber-500 focus:outline-none"
                  placeholder="Repetí la contraseña"
                />
              </div>
              {error && (
                <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              )}
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

        {/* Paso 3 — Google Drive (placeholder) */}
        {step === 2 && (
          <div className="text-center space-y-6">
            <div className="text-5xl">☁️</div>
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Guardar en Google Drive</h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Conectar tu cuenta de Google permite guardar tus escritos en la nube.
              Por ahora los capítulos se guardan en este dispositivo.
            </p>
            <div className="bg-amber-100 dark:bg-stone-800 rounded-2xl p-4 text-stone-600 dark:text-stone-400 text-sm">
              La integración con Google Drive estará disponible próximamente.
            </div>
            <button
              onClick={handleDriveSkip}
              className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white text-xl font-semibold rounded-2xl transition-colors"
            >
              Empezar a escribir →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
