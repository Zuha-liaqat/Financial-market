import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ConfirmDialog from '../../components/ConfirmDialog'
import CreateCompanyModal from '../../components/CreateCompanyModal'
import {
  addCompanies,
  addCompany,
  avatarColors,
  deleteCompany,
  generateCompanyId,
  getAllCompanies,
  nextAvatarColor,
} from '../../data/companies'
import { apiCreateUser, apiDeleteUser, apiListUsers } from '../../lib/api'

const statusStyles = {
  Active: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
  Trial: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
  Suspended: 'bg-red-50 text-red-600 ring-1 ring-red-200',
}

const statusDotColor = {
  Active: 'bg-emerald-500',
  Trial: 'bg-amber-500',
  Suspended: 'bg-red-500',
}

function formatDate(isoString) {
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

function StatTile({ icon, iconBg, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>{icon}</span>
      <div>
        <p className="text-2xl font-bold text-black">{value}</p>
        <p className="text-xs text-neutral-400">{label}</p>
      </div>
    </div>
  )
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

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const loadCompanies = () => setCompanies(getAllCompanies())

  useEffect(() => {
    loadCompanies()
    syncCompaniesFromApi()
  }, [])

  async function syncCompaniesFromApi() {
    try {
      const users = await apiListUsers()
      const existing = getAllCompanies()
      const existingApiIds = new Set(existing.map((c) => c.apiUserId).filter(Boolean))
      const existingEmails = new Set(existing.map((c) => c.email).filter(Boolean))

      const usersToAdd = (users || []).filter(
        (u) => !u.is_superuser && u.role !== 'superadmin' && !existingApiIds.has(u.id) && !existingEmails.has(u.email),
      )
      if (!usersToAdd.length) return

      let idNum = existing.reduce((max, c) => {
        const n = parseInt(String(c.id).replace('CMP-', ''), 10)
        return Number.isNaN(n) ? max : Math.max(max, n)
      }, 1000)

      const newCompanies = usersToAdd.map((u, idx) => {
        idNum += 1
        return {
          id: `CMP-${idNum}`,
          name: u.full_name || u.email,
          plan: 'Free',
          status: u.is_active ? 'Active' : 'Suspended',
          role: u.role || 'user',
          joinedDate: u.created_at || new Date().toISOString(),
          avatarColor: avatarColors[(existing.length + idx) % avatarColors.length],
          billingHistory: [],
          email: u.email,
          apiUserId: u.id,
        }
      })

      addCompanies(newCompanies)
      loadCompanies()
    } catch (err) {
      console.error('Failed to sync companies from API', err)
    }
  }

  async function confirmDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      if (deleteTarget.apiUserId) {
        await apiDeleteUser(deleteTarget.apiUserId)
      }
      deleteCompany(deleteTarget.id)
      loadCompanies()
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  async function handleCreateCompany({ name, email, password, isActive }) {
    const apiUser = await apiCreateUser({
      email,
      full_name: name,
      role: 'user',
      is_active: isActive,
      password,
    })

    addCompany({
      id: generateCompanyId(),
      name,
      plan: 'Free',
      status: isActive ? 'Active' : 'Suspended',
      role: apiUser?.role || 'user',
      joinedDate: apiUser?.created_at || new Date().toISOString(),
      avatarColor: nextAvatarColor(),
      billingHistory: [],
      email,
      apiUserId: apiUser?.id,
    })

    loadCompanies()
    setShowCreateModal(false)
  }

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.trim().toLowerCase())
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [companies, search, statusFilter])

  const statusOptions = ['all', 'Active', 'Trial', 'Suspended']
  const statusCountColor = {
    all: 'bg-neutral-100 text-neutral-600',
    Active: 'bg-emerald-100 text-emerald-700',
    Trial: 'bg-amber-100 text-amber-700',
    Suspended: 'bg-red-100 text-red-700',
  }
  const statusCounts = {
    all: companies.length,
    Active: companies.filter((c) => c.status === 'Active').length,
    Trial: companies.filter((c) => c.status === 'Trial').length,
    Suspended: companies.filter((c) => c.status === 'Suspended').length,
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label="Total Companies"
          value={statusCounts.all}
          iconBg="bg-brand-100 text-brand-700"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.25 21h19.5M4.5 3.75h9a.75.75 0 01.75.75V21H4.5V4.5a.75.75 0 01.75-.75zM13.5 9h5.25a.75.75 0 01.75.75V21h-6V9.75A.75.75 0 0113.5 9z" />
            </svg>
          }
        />
        <StatTile
          label="Active"
          value={statusCounts.Active}
          iconBg="bg-emerald-100 text-emerald-700"
          icon={
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.5 2.25L3.75 13.5h6.75l-1.5 8.25 9.75-11.25h-6.75l1.5-8.25z" />
            </svg>
          }
        />
        <StatTile
          label="Trial"
          value={statusCounts.Trial}
          iconBg="bg-amber-100 text-amber-700"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatTile
          label="Suspended"
          value={statusCounts.Suspended}
          iconBg="bg-red-100 text-red-700"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
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

        <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-neutral-100 p-1">
          {statusOptions.map((s) => {
            const active = statusFilter === s
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  active ? 'bg-brand-600 text-white shadow-md shadow-brand-200' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {s === 'all' ? 'All' : s}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums ${
                    active ? 'bg-white/20 text-white' : statusCountColor[s]
                  }`}
                >
                  {statusCounts[s]}
                </span>
              </button>
            )
          })}
        </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 hover:shadow-md"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Company
        </button>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] table-fixed text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-semibold tracking-widest text-neutral-400">
                <th className="w-[28%] rounded-tl-lg px-4 py-3.5">COMPANY</th>
                <th className="w-[22%] px-3 py-3.5">EMAIL</th>
                <th className="w-[14%] px-3 py-3.5">STATUS</th>
                <th className="w-[12%] px-3 py-3.5">ROLE</th>
                <th className="w-[18%] px-3 py-3.5">JOINED</th>
                <th className="w-16 rounded-tr-lg px-3 py-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((company) => (
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
                  <td className="px-3 py-3.5 capitalize text-neutral-600">{company.role || 'user'}</td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-neutral-500">{formatDate(company.joinedDate)}</td>
                  <td className="px-3 py-3.5 text-right">
                    <ActionsMenu onDelete={() => setDeleteTarget(company)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-neutral-400">No companies match your filters.</div>
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

      {showCreateModal && (
        <CreateCompanyModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCompany}
        />
      )}
    </div>
  )
}
