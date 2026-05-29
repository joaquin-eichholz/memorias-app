import { useState, useEffect, useCallback } from 'react'

const SCOPES = 'https://www.googleapis.com/auth/drive.file'
const FOLDER_NAME = import.meta.env.VITE_DRIVE_FOLDER_NAME || 'Memorias'
const TOKEN_KEY = 'drive_access_token'
const FOLDER_ID_KEY = 'drive_folder_id'

const BASE = 'https://www.googleapis.com/drive/v3'
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3'

function getToken() { return sessionStorage.getItem(TOKEN_KEY) }
function setToken(t) { sessionStorage.setItem(TOKEN_KEY, t) }
function clearToken() { sessionStorage.removeItem(TOKEN_KEY) }

async function driveRequest(url, options = {}) {
  const token = getToken()
  const res = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
  })
  if (res.status === 401) { clearToken(); throw new Error('token_expired') }
  return res
}

export function useDrive() {
  const [connected, setConnected] = useState(!!getToken())
  const [folderId, setFolderId] = useState(sessionStorage.getItem(FOLDER_ID_KEY))
  const [loading, setLoading] = useState(false)
  const [tokenClient, setTokenClient] = useState(null)

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !window.google) return

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: async (response) => {
        if (response.access_token) {
          setToken(response.access_token)
          setConnected(true)
          await ensureFolder()
        }
      },
    })
    setTokenClient(client)
  }, [])

  const connect = useCallback(() => {
    if (tokenClient) tokenClient.requestAccessToken()
  }, [tokenClient])

  const disconnect = useCallback(() => {
    const token = getToken()
    if (token && window.google) {
      window.google.accounts.oauth2.revoke(token)
    }
    clearToken()
    sessionStorage.removeItem(FOLDER_ID_KEY)
    setConnected(false)
    setFolderId(null)
  }, [])

  async function ensureFolder() {
    const res = await driveRequest(
      `${BASE}/files?q=name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`
    )
    const data = await res.json()
    if (data.files?.length > 0) {
      const id = data.files[0].id
      sessionStorage.setItem(FOLDER_ID_KEY, id)
      setFolderId(id)
      return id
    }
    // Crear la carpeta
    const create = await driveRequest(`${BASE}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
    })
    const folder = await create.json()
    sessionStorage.setItem(FOLDER_ID_KEY, folder.id)
    setFolderId(folder.id)
    return folder.id
  }

  async function listFiles() {
    const id = folderId || await ensureFolder()
    const res = await driveRequest(
      `${BASE}/files?q='${id}' in parents and trashed=false and name!='_index.json'&fields=files(id,name,modifiedTime)&orderBy=name`
    )
    const data = await res.json()
    return data.files || []
  }

  async function readFile(fileId) {
    const res = await driveRequest(`${BASE}/files/${fileId}?alt=media`)
    return res.text()
  }

  async function createFile(name, content) {
    const id = folderId || await ensureFolder()
    const metadata = { name, parents: [id] }
    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('media', new Blob([content], { type: 'text/plain' }))
    const res = await driveRequest(`${UPLOAD}/files?uploadType=multipart&fields=id,name,modifiedTime`, {
      method: 'POST',
      body: form,
    })
    return res.json()
  }

  async function updateFile(fileId, content) {
    const res = await driveRequest(`${UPLOAD}/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'text/plain' },
      body: content,
    })
    return res.json()
  }

  async function deleteFile(fileId) {
    await driveRequest(`${BASE}/files/${fileId}`, { method: 'DELETE' })
  }

  return {
    connected,
    loading,
    connect,
    disconnect,
    listFiles,
    readFile,
    createFile,
    updateFile,
    deleteFile,
  }
}
