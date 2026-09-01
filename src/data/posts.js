import { queueItems } from './queueItems'

const STORAGE_KEY = 'app_posts'
const SEED_VERSION = 4

function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.version === SEED_VERSION) return parsed.posts
    }
  } catch {
    // fall through to reseed from the static defaults
  }
  savePosts(queueItems)
  return queueItems
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SEED_VERSION, posts }))
}

export function getAllQueueItems() {
  return loadPosts()
}

export function getQueueItemById(id) {
  return getAllQueueItems().find((p) => p.id === id)
}

export function getGeneratedPosts() {
  return loadPosts().filter((p) => p.scheduleDate)
}

export function saveGeneratedPost(post) {
  const posts = loadPosts()
  const existing = posts.some((p) => p.id === post.id)
  const next = existing ? posts.map((p) => (p.id === post.id ? post : p)) : [post, ...posts]
  savePosts(next)
  return post
}

export function updateGeneratedPost(id, updates) {
  const posts = loadPosts()
  const next = posts.map((p) => (p.id === id ? { ...p, ...updates } : p))
  savePosts(next)
  return next.find((p) => p.id === id)
}

export function removeGeneratedPost(id) {
  const posts = loadPosts()
  savePosts(posts.filter((p) => p.id !== id))
}
