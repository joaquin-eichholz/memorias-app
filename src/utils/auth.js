const HASH_KEY = 'memorias_pwd_hash'
const SETUP_KEY = 'memorias_setup_complete'
const SESSION_KEY = 'memorias_session'

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
}

export async function createPassword(password) {
  const hash = await hashPassword(password)
  localStorage.setItem(HASH_KEY, hash)
  localStorage.setItem(SETUP_KEY, 'true')
  sessionStorage.setItem(SESSION_KEY, '1')
}

export async function verifyPassword(input) {
  const stored = localStorage.getItem(HASH_KEY)
  if (!stored) return false
  const hash = await hashPassword(input)
  const ok = hash === stored
  if (ok) sessionStorage.setItem(SESSION_KEY, '1')
  return ok
}

export function isSetupComplete() {
  return localStorage.getItem(SETUP_KEY) === 'true'
}

export function isSessionActive() {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}
