import { useState } from 'react'
import { verifyPassword } from '../utils/auth'

export default function Login({ onSuccess }) {
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await verifyPassword(pwd)
    setLoading(false)
    if (ok) {
      onSuccess()
    } else {
      setError('Contraseña incorrecta. Intentá de nuevo.')
      setPwd('')
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-stone-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Mis Memorias</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2">Ingresá tu contraseña para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            className="w-full text-xl p-4 border-2 border-stone-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-800 dark:text-stone-100 focus:border-amber-500 focus:outline-none text-center"
            placeholder="••••••••"
            autoFocus
          />
          {error && (
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !pwd}
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xl font-semibold rounded-2xl transition-colors"
          >
            {loading ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
