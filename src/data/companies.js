const STORAGE_KEY = 'app_companies'
const SEED_VERSION = 3

const avatarColors = [
  'bg-gradient-to-br from-sky-400 to-brand-600',
  'bg-gradient-to-br from-violet-400 to-fuchsia-600',
  'bg-gradient-to-br from-emerald-400 to-teal-600',
  'bg-gradient-to-br from-amber-400 to-orange-600',
  'bg-gradient-to-br from-rose-400 to-pink-600',
]

const defaultCompanies = [
  {
    id: 'CMP-1001',
    name: 'Aurora Media Group',
    plan: 'Top Tier',
    status: 'Active',
    usersCount: 24,
    joinedDate: '2025-02-14',
    avatarColor: avatarColors[0],
    billingHistory: [
      { id: 'INV-3001', date: '2026-08-01', amount: 299, status: 'Paid' },
      { id: 'INV-2988', date: '2026-07-01', amount: 299, status: 'Paid' },
      { id: 'INV-2971', date: '2026-06-01', amount: 299, status: 'Paid' },
    ],
  },
  {
    id: 'CMP-1002',
    name: 'BVB Financial Market',
    plan: 'Pro',
    status: 'Active',
    usersCount: 9,
    joinedDate: '2025-05-02',
    avatarColor: avatarColors[1],
    billingHistory: [
      { id: 'INV-3050', date: '2026-08-05', amount: 49, status: 'Paid' },
      { id: 'INV-3012', date: '2026-07-05', amount: 49, status: 'Paid' },
    ],
  },
  {
    id: 'CMP-1003',
    name: 'Northwind Robotics',
    plan: 'Pro',
    status: 'Trial',
    usersCount: 3,
    joinedDate: '2026-07-20',
    avatarColor: avatarColors[2],
    billingHistory: [],
  },
  {
    id: 'CMP-1004',
    name: 'Investment Academy',
    plan: 'Free',
    status: 'Active',
    usersCount: 2,
    joinedDate: '2026-01-11',
    avatarColor: avatarColors[3],
    billingHistory: [],
  },
  {
    id: 'CMP-1005',
    name: 'Crypto Market Update',
    plan: 'Top Tier',
    status: 'Suspended',
    usersCount: 15,
    joinedDate: '2024-11-30',
    avatarColor: avatarColors[4],
    billingHistory: [
      { id: 'INV-2890', date: '2026-05-01', amount: 299, status: 'Failed' },
      { id: 'INV-2855', date: '2026-04-01', amount: 299, status: 'Paid' },
    ],
  },
]

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
