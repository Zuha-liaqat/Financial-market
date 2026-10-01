import { useEffect, useMemo, useState } from 'react'
import Pagination from '../../components/Pagination'
import SpacedRow from '../../components/SpacedRow'
import { ErrorToast } from '../../components/Toast'
import { apiAdminListReferrals } from '../../lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
  Joined: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
}

const statusDotColor = {
  Pending: 'bg-amber-500',
  Joined: 'bg-emerald-500',
}

const sourceLabels = {
  email: 'Email',
  link: 'Link',
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

function capitalize(value) {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

// The API groups invites under each referring company; the table lists one row per invite.
function toRows(referrers) {
  return (referrers || []).flatMap((ref) =>
    (ref.referrals || []).map((r, i) => ({
      id: `${ref.company_id}-${i}-${r.invited_email}`,
      referrerName: ref.company_name || ref.company_email,
      referrerEmail: ref.company_email,
      invitedEmail: r.invited_email,
      status: capitalize(r.status),
      source: sourceLabels[r.source] || capitalize(r.source) || '—',
      credits: r.credits ?? 0,
      sentAt: r.sent_at || r.created_at,
    })),
  )
}

function StatCard({ label, value, loading }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      {loading ? (
        <div className="mt-3 h-7 w-16 animate-pulse rounded bg-neutral-200" />
      ) : (
        <p className="mt-2 text-2xl font-semibold text-black">{value}</p>
      )}
    </div>
  )
}

function RowSkeleton() {
  return (
    <SpacedRow className="border-b border-neutral-100 last:border-0">
      {['w-36', 'w-40', 'w-16', 'w-12', 'w-8', 'w-20'].map((w, i) => (
        <td key={i} className={i === 0 ? 'px-4 py-3.5' : 'px-3 py-3.5'}>
          <div className={`h-3.5 animate-pulse rounded bg-neutral-200 ${w}`} />
        </td>
      ))}
    </SpacedRow>
  )
}

export default function ReferralsPage() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    apiAdminListReferrals()
      .then((body) => {
        if (cancelled) return
        setData(body)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message || 'Failed to load referrals')
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const rows = useMemo(() => toRows(data?.referrers), [data])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      const matchesSearch =
        !q ||
        r.referrerName?.toLowerCase().includes(q) ||
        r.referrerEmail?.toLowerCase().includes(q) ||
        r.invitedEmail?.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [rows, search, statusFilter])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const loading = status === 'loading'

  return (
    <div className="space-y-4">
      {status === 'error' && <ErrorToast message={error} onClose={() => setError('')} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total invites" value={data?.total_invites ?? 0} loading={loading} />
        <StatCard label="Joined" value={data?.joined ?? 0} loading={loading} />
        <StatCard label="Active referrers" value={data?.active_referrers ?? 0} loading={loading} />
        <StatCard
          label="Credits awarded"
          value={(data?.credits_awarded ?? 0).toLocaleString('en-US')}
          loading={loading}
        />
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
              placeholder="Search by company or email..."
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
          <table className="w-full min-w-215 table-even-gaps text-left text-sm">
            <thead>
              <SpacedRow header className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-semibold tracking-widest text-neutral-400">
                <th className="px-4 py-3.5">REFERRED BY</th>
                <th className="px-3 py-3.5">INVITED EMAIL</th>
                <th className="px-3 py-3.5">STATUS</th>
                <th className="px-3 py-3.5">SOURCE</th>
                <th className="px-3 py-3.5">CREDITS</th>
                <th className="px-3 py-3.5">SENT</th>
              </SpacedRow>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
              {paginated.map((r) => (
                <SpacedRow key={r.id} className="border-b border-neutral-100 last:border-0 transition hover:bg-brand-50/40">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-black">{r.referrerName || '—'}</p>
                    {r.referrerEmail && r.referrerEmail !== r.referrerName && (
                      <p className="text-xs text-neutral-500">{r.referrerEmail}</p>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-neutral-600">{r.invitedEmail || '—'}</td>
                  <td className="px-3 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${statusStyles[r.status] || statusStyles.Pending}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDotColor[r.status] || statusDotColor.Pending}`} />
                      {r.status || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-neutral-600">{r.source}</td>
                  <td className="px-3 py-3.5 text-neutral-600">{r.credits}</td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-neutral-500">{formatDate(r.sentAt)}</td>
                </SpacedRow>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-neutral-400">
            {rows.length === 0 ? 'No referrals yet.' : 'No referrals match your filters.'}
          </div>
        )}

        {filtered.length > 0 && (
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
        )}
      </div>
    </div>
  )
}
