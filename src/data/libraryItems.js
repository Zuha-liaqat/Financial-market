const STORAGE_KEY = 'app_library_items'
const SEED_VERSION = 4

const seedItems = [
  {
    id: 'lib-1',
    name: 'Crypto_Market_Coverage',
    type: 'Marketing',
    media_type: 'photo',
    image_url: '/library-bitcoin.jpg',
    size_kb: 212.4,
    created_at: '2026-07-18T10:00:00.000Z',
  },
  {
    id: 'lib-2',
    name: 'Feel_the_Markets_Interview',
    type: 'Events',
    media_type: 'video',
    image_url: null,
    size_kb: 48200,
    created_at: '2026-07-15T09:30:00.000Z',
  },
  {
    id: 'lib-3',
    name: 'Stock_Market_Trends',
    type: 'Marketing',
    media_type: 'photo',
    image_url: '/Stock1.jpg',
    size_kb: 50.2,
    created_at: '2026-07-10T14:00:00.000Z',
  },
  {
    id: 'lib-5',
    name: 'Investment_Academy_Ep12',
    type: 'Product',
    media_type: 'video',
    image_url: null,
    size_kb: 63500,
    created_at: '2026-06-28T16:45:00.000Z',
  },
  {
    id: 'lib-6',
    name: 'Q3_Research_Brief',
    type: 'Design',
    media_type: 'article',
    image_url: null,
    size_kb: 240,
    created_at: '2026-06-20T08:00:00.000Z',
  },
  {
    id: 'lib-7',
    name: 'Trading_Floor_Analysis',
    type: 'Marketing',
    media_type: 'photo',
    image_url: '/Stock2.png',
    size_kb: 713.7,
    created_at: '2026-06-14T09:20:00.000Z',
  },
]

function readFileAsDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.version === SEED_VERSION) return parsed.items
    }
  } catch {
    // fall through to reseed from the static defaults
  }
  save(seedItems)
  return seedItems
}

function save(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SEED_VERSION, items }))
}

export function getLibraryItems() {
  return load()
}

export async function createLibraryItem({ name, type, mediaType, media }) {
  const items = load()
  const imageUrl = mediaType === 'photo' && media ? await readFileAsDataUri(media) : null
  const item = {
    id: `lib-${Date.now()}`,
    name,
    type,
    media_type: mediaType,
    image_url: imageUrl,
    size_kb: media ? media.size / 1024 : 0,
    created_at: new Date().toISOString(),
  }
  save([item, ...items])
  return item
}

export async function updateLibraryItem(id, { name, type, mediaType, media }) {
  const imageUrl = mediaType === 'photo' && media ? await readFileAsDataUri(media) : undefined
  const items = load()
  const next = items.map((item) =>
    item.id === id
      ? {
          ...item,
          ...(name !== undefined ? { name } : {}),
          ...(type !== undefined ? { type } : {}),
          ...(media ? { media_type: mediaType, size_kb: media.size / 1024 } : {}),
          ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
        }
      : item,
  )
  save(next)
  return next.find((item) => item.id === id)
}

export function deleteLibraryItem(id) {
  const items = load()
  save(items.filter((item) => item.id !== id))
}
