const STORAGE_KEY = 'app_companies'
const SEED_VERSION = 4

const avatarColors = [
  'bg-gradient-to-br from-sky-400 to-brand-600',
  'bg-gradient-to-br from-violet-400 to-fuchsia-600',
  'bg-gradient-to-br from-emerald-400 to-teal-600',
  'bg-gradient-to-br from-amber-400 to-orange-600',
  'bg-gradient-to-br from-rose-400 to-pink-600',
]

const defaultCompanies = []

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.version === SEED_VERSION) return parsed.companies
    }
  } catch {
    // fall through to reseed from the static defaults
  }
  save(defaultCompanies)
  return defaultCompanies
}

function save(companies) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SEED_VERSION, companies }))
}

export function getAllCompanies() {
  return load()
}

export function getCompanyById(id) {
  return getAllCompanies().find((c) => c.id === id)
}

export function updateCompany(id, updates) {
  const companies = load()
  const next = companies.map((c) => (c.id === id ? { ...c, ...updates } : c))
  save(next)
  return next.find((c) => c.id === id)
}

export function deleteCompany(id) {
  const companies = load()
  save(companies.filter((c) => c.id !== id))
}

export function addCompany(company) {
  const companies = load()
  const next = [company, ...companies]
  save(next)
  return company
}

export function addCompanies(newCompanies) {
  if (!newCompanies.length) return load()
  const companies = load()
  const next = [...newCompanies, ...companies]
  save(next)
  return next
}

export function generateCompanyId() {
  const companies = load()
  const nums = companies
    .map((c) => parseInt(String(c.id).replace('CMP-', ''), 10))
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 1000
  return `CMP-${max + 1}`
}

export function nextAvatarColor() {
  const companies = load()
  return avatarColors[companies.length % avatarColors.length]
}

export { avatarColors }
