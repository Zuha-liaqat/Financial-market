import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ConfirmDialog from '../../components/ConfirmDialog'
import { avatarColors } from '../../data/companies'
import { apiDeleteUser, apiListUsers } from '../../lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

const statusStyles = {
  Active: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
  Inactive: 'bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200',
}

const statusDotColor = {
  Active: 'bg-emerald-500',
  Inactive: 'bg-neutral-400',
}

// "Pro Plan (Monthly)" -> "Pro", used to group companies in the plan filter.
function planGroup(planName) {
  return (planName || 'Free').replace(/\s*plan\b.*$/i, '').trim() || 'Free'
}

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function getPageNumbers(page, totalPages) {
  const pages = []
  const add = (p) => {
    if (!pages.includes(p)) pages.push(p)
  }

  add(1)
  for (let p = page - 1; p <= page + 1; p++) {
    if (p > 1 && p < totalPages) add(p)
  }
  if (totalPages > 1) add(totalPages)

  const withGaps = []
  let prev = 0
  for (const p of pages.sort((a, b) => a - b)) {
    if (prev && p - prev > 1) withGaps.push('…')
    withGaps.push(p)
    prev = p
  }
  return withGaps
}

function ActionsMenu({ onDelete }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  function updatePosition() {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setCoords({ top: rect.bottom + 4, left: rect.right - 144 })
  }

  function toggleOpen() {
    if (!open) updatePosition()
    setOpen((v) => !v)
  }

  useEffect(() => {
    function handleOutside(e) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  return (
    <div className="relative inline-block text-left">
      <button
        ref={triggerRef}
        onClick={toggleOpen}
        aria-label="Actions"
        className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition ${
          open ? 'border-brand-300 bg-brand-50 text-brand-600' : 'border-neutral-200 text-neutral-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600'
        }`}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="12" cy="19" r="1.75" />
        </svg>
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: 'fixed', top: coords.top, left: coords.left }}
            className="z-50 w-36 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
          >
            <button
              onClick={() => {
                setOpen(false)
                onDelete()
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9M19.228 5.79c1.121.113 2.235.256 3.34.428m-3.34-.428L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c1.105-.172 2.219-.315 3.34-.428m0 0a48.108 48.108 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              Delete
            </button>
          </div>,
          document.body,
        )}
    </div>
  )
}

const PAGE_SIZE = 10

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [page, setPage] = useState(1)

  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState('')

  // The table shows exactly what /api/company returns (super admins excluded).
  useEffect(() => {
    let cancelled = false
    apiListUsers()
      .then((users) => {
        if (cancelled) return
        const list = (users || [])
          .filter((u) => !u.is_superuser && u.role !== 'superadmin')
          .map((u, idx) => ({
            id: u.id,
            name: u.name || u.email,
            email: u.email,
            plan: u.plan?.plan_name || 'Free',
            status: u.is_active ? 'Active' : 'Inactive',
            role: u.role || 'company',
            joinedDate: u.created_at,
            avatarColor: avatarColors[idx % avatarColors.length],
          }))
        setCompanies(list)
        setLoadState('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err.message || 'Failed to load companies')
        setLoadState('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function confirmDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await apiDeleteUser(deleteTarget.id)
      setCompanies((list) => list.filter((c) => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.trim().toLowerCase())
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      const matchesPlan = planFilter === 'all' || planGroup(c.plan) === planFilter
      return matchesSearch && matchesStatus && matchesPlan
    })
  }, [companies, search, statusFilter, planFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, planFilter])

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  )

  const planOptions = [...new Set(companies.map((c) => planGroup(c.plan)))].sort()

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-56">
            <svg
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies..."
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-8 pr-3 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white py-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-40 bg-white py-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              {planOptions.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] table-fixed text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-semibold tracking-widest text-neutral-400">
                <th className="w-[24%] px-4 py-3.5">COMPANY</th>
                <th className="w-[18%] px-3 py-3.5">EMAIL</th>
                <th className="w-[12%] px-3 py-3.5">STATUS</th>
                <th className="w-[16%] px-3 py-3.5">PLAN</th>
                <th className="w-[10%] px-3 py-3.5">ROLE</th>
                <th className="w-[14%] px-3 py-3.5">JOINED</th>
                <th className="w-16 px-3 py-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((company) => (
                <tr
                  key={company.id}
                  className="border-b border-neutral-100 last:border-0 transition hover:bg-brand-50/40"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white shadow-sm ${company.avatarColor}`}
                      >
                        {getInitials(company.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-black">{company.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="truncate px-3 py-3.5 text-neutral-500">{company.email || '—'}</td>
                  <td className="px-3 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${statusStyles[company.status]}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDotColor[company.status]}`} />
                      {company.status}
                    </span>
                  </td>
                  <td className="truncate px-3 py-3.5 text-neutral-600">{company.plan || 'Free'}</td>
                  <td className="px-3 py-3.5 capitalize text-neutral-600">{company.role || 'company'}</td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-neutral-500">{formatDate(company.joinedDate)}</td>
                  <td className="px-3 py-3.5 text-right">
                    <ActionsMenu onDelete={() => setDeleteTarget(company)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loadState === 'loading' && (
          <div className="p-10 text-center text-sm text-neutral-400">Loading companies…</div>
        )}
        {loadState === 'error' && (
          <div className="p-10 text-center text-sm font-medium text-red-600">{loadError}</div>
        )}
        {loadState === 'ready' && filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-neutral-400">
            {companies.length === 0 ? 'No companies yet.' : 'No companies match your filters.'}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3">
            <p className="text-xs text-neutral-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:bg-transparent disabled:hover:text-neutral-500"
                aria-label="Previous page"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              {getPageNumbers(page, totalPages).map((p, i) =>
                p === '…' ? (
                  <span key={`gap-${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-neutral-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    aria-current={p === page ? 'page' : undefined}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition ${
                      p === page
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'text-neutral-600 hover:bg-brand-50 hover:text-brand-600'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:bg-transparent disabled:hover:text-neutral-500"
                aria-label="Next page"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete company"
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          confirming={deleting}
          error={deleteError}
          onCancel={() => {
            setDeleteTarget(null)
            setDeleteError('')
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
