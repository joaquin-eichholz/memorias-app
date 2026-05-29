const INDEX_KEY = 'memorias_index'
const CHAPTER_PREFIX = 'memorias_chapter_'

function now() {
  return new Date().toISOString()
}

export function getIndex() {
  const raw = localStorage.getItem(INDEX_KEY)
  if (!raw) return { chapters: [] }
  return JSON.parse(raw)
}

function saveIndex(index) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(index))
}

export function getChapter(id) {
  const raw = localStorage.getItem(CHAPTER_PREFIX + id)
  if (!raw) return null
  return JSON.parse(raw)
}

export function saveChapter(id, content) {
  const index = getIndex()
  const entry = index.chapters.find(c => c.id === id)
  if (entry) entry.updatedAt = now()
  saveIndex(index)
  localStorage.setItem(CHAPTER_PREFIX + id, JSON.stringify({ id, content, updatedAt: now() }))
}

export function createChapter(title) {
  const id = `ch_${Date.now()}`
  const index = getIndex()
  index.chapters.push({ id, title, createdAt: now(), updatedAt: now() })
  saveIndex(index)
  localStorage.setItem(CHAPTER_PREFIX + id, JSON.stringify({ id, content: '', updatedAt: now() }))
  return id
}

export function updateChapterTitle(id, title) {
  const index = getIndex()
  const entry = index.chapters.find(c => c.id === id)
  if (entry) {
    entry.title = title
    entry.updatedAt = now()
    saveIndex(index)
  }
}

export function deleteChapter(id) {
  const index = getIndex()
  index.chapters = index.chapters.filter(c => c.id !== id)
  saveIndex(index)
  localStorage.removeItem(CHAPTER_PREFIX + id)
}

export function reorderChapters(orderedIds) {
  const index = getIndex()
  const map = Object.fromEntries(index.chapters.map(c => [c.id, c]))
  index.chapters = orderedIds.map(id => map[id]).filter(Boolean)
  saveIndex(index)
}
