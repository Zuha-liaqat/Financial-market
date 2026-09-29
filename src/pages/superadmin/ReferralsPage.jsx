import { useEffect, useMemo, useState } from 'react'
import SpacedRow from '../../components/SpacedRow'
import { sampleReferrals } from '../../data/referrals'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
  Joined: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
}

const statusDotColor = {
  Pending: 'bg-amber-500',
  Joined: 'bg-emerald-500',
}

const PAGE_SIZE = 10

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-black">{value}</p>
    </div>
  )
}

export default function ReferralsPage() {
  // Static until the referrals API is available.
  const referrals = sampleReferrals
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return referrals.filter((r) => {
      const matchesSearch = !q || r.referrer?.toLowerCase().includes(q) || r.referee?.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [referrals, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const joinedCount = referrals.filter((r) => r.status === 'Joined').length
  const totalCredits = referrals.reduce((sum, r) => sum + r.credits, 0)
  const referrerCount = new Set(referrals.map((r) => r.referrer)).size

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total invites" value={referrals.length} />
        <StatCard label="Joined" value={joinedCount} />
        <StatCard label="Active referrers" value={referrerCount} />
        <StatCard label="Credits awarded" value={totalCredits.toLocaleString('en-US')} />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 px-4 py-3">
          <div className="relative w-64">
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
              placeholder="Search by email..."
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-8 pr-3 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white py-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Joined">Joined</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] table-even-gaps text-left text-sm">
            <thead>
              <SpacedRow header className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-semibold tracking-widest text-neutral-400">
                <th className="px-4 py-3.5">REFERRED BY</th>
                <th className="px-3 py-3.5">INVITED EMAIL</th>
                <th className="px-3 py-3.5">STATUS</th>
                <th className="px-3 py-3.5">CREDITS</th>
                <th className="px-3 py-3.5">SENT</th>
              </SpacedRow>
            </thead>
            <tbody>
              {paginated.map((r) => (
                <SpacedRow key={r.id} className="border-b border-neutral-100 last:border-0 transition hover:bg-brand-50/40">
                  <td className="px-4 py-3.5 font-medium text-black">{r.referrer || '—'}</td>
                  <td className="px-3 py-3.5 text-neutral-600">{r.referee || '—'}</td>
                  <td className="px-3 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${statusStyles[r.status]}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDotColor[r.status]}`} />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-neutral-600">{r.credits}</td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-neutral-500">{formatDate(r.sentAt)}</td>
                </SpacedRow>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-neutral-400">
            {referrals.length === 0 ? 'No referrals yet.' : 'No referrals match your filters.'}
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3">
            <p className="text-xs text-neutral-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-neutral-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
