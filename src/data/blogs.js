const STORAGE_KEY = 'app_blogs'
const SEED_VERSION = 1

const defaultBlogs = [
  {
    id: 'BLG-1001',
    title: 'How AI is Reshaping Content Marketing in 2026',
    thumbClass: 'bg-gradient-to-br from-violet-200 to-fuchsia-400',
    status: 'STAGING',
    timestamp: '2 days ago',
    language: 'EN-US',
    tone: 'Informative',
    caption:
      'A look at how generative AI tools are changing the way marketing teams plan, draft, and publish long-form content.',
    hashtags: ['#AI', '#ContentMarketing'],
    images: [],
    scheduleDate: undefined,
  },
  {
    id: 'BLG-1002',
    title: '5 Lessons from Scaling Our Approval Workflow',
    thumbClass: 'bg-gradient-to-br from-sky-200 to-slate-400',
    status: 'STAGING',
    timestamp: '5 days ago',
    language: 'EN-US',
    tone: 'Professional',
    caption:
      'What we learned building an approval queue that keeps content teams and reviewers in sync without slowing down publishing.',
    hashtags: ['#Product', '#Workflow'],
    images: [],
    scheduleDate: undefined,
  },
]

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.version === SEED_VERSION) return parsed.blogs
    }
  } catch {
    // fall through to reseed from the static defaults
  }
  save(defaultBlogs)
  return defaultBlogs
}

function save(blogs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SEED_VERSION, blogs }))
}

export function getAllBlogs() {
  return load()
}

export function getBlogById(id) {
  return getAllBlogs().find((b) => b.id === id)
}

export function saveGeneratedBlog(blog) {
  const blogs = load()
  const existing = blogs.some((b) => b.id === blog.id)
  const next = existing ? blogs.map((b) => (b.id === blog.id ? blog : b)) : [blog, ...blogs]
  save(next)
  return blog
}

export function updateBlog(id, updates) {
  const blogs = load()
  const next = blogs.map((b) => (b.id === id ? { ...b, ...updates } : b))
  save(next)
  return next.find((b) => b.id === id)
}

export function removeBlog(id) {
  const blogs = load()
  save(blogs.filter((b) => b.id !== id))
}
