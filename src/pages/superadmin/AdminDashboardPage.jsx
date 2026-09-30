import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { avatarColors } from '../../data/companies'
import { apiGetSuperAdminDashboard, apiListUsers } from '../../lib/api'
import { formatRelativeTime } from '../../lib/posts'
import { ErrorToast } from '../../components/Toast'
import SpacedRow from '../../components/SpacedRow'
import ChannelBadges from '../../components/ChannelBadges'

const RECENT_LIMIT = 5

const statusStyles = {
  Active: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
  Inactive: 'bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200',
  Suspended: 'bg-red-50 text-red-600 ring-1 ring-red-200',
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function UpArrow() {
  return (
    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5m0 0l-6 6m6-6l6 6" />
    </svg>
  )
}

function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-neutral-200 bg-white p-5">
          <div className="h-3.5 w-28 animate-pulse rounded bg-neutral-200" />
          <div className="mt-3 h-7 w-16 animate-pulse rounded bg-neutral-200" />
          <div className="mt-3 h-3 w-24 animate-pulse rounded bg-neutral-200" />
        </div>
      ))}
    </div>
  )
}

function RecentRowSkeleton() {
  return (
    <SpacedRow className="border-b border-neutral-100 last:border-0">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-neutral-200" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 animate-pulse rounded bg-neutral-200" />
            <div className="h-3 w-40 animate-pulse rounded bg-neutral-200" />
          </div>
        </div>
      </td>
      <td className="px-3 py-3.5">
        <div className="h-6 w-20 animate-pulse rounded-md bg-neutral-200" />
      </td>
      <td className="px-3 py-3.5">
        <div className="h-3.5 w-16 animate-pulse rounded bg-neutral-200" />
      </td>
      <td className="px-3 py-3.5">
        <div className="h-3.5 w-16 animate-pulse rounded bg-neutral-200" />
      </td>
      <td className="px-3 py-3.5">
        <div className="h-5 w-16 animate-pulse rounded-full bg-neutral-200" />
      </td>
    </SpacedRow>
  )
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [channelsById, setChannelsById] = useState({})
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    // recent_companies has no connected_accounts, so they are looked up from the users list.
    apiListUsers()
      .then((users) => {
        if (cancelled) return
        setChannelsById(Object.fromEntries((users || []).map((u) => [u.id, u.connected_accounts || []])))
      })
      .catch(() => {})
    apiGetSuperAdminDashboard({ recent_limit: RECENT_LIMIT })
      .then((body) => {
        if (cancelled) return
        setData(body)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message || 'Failed to load dashboard')
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const totalCompanies = data?.total_companies ?? 0
  const joinedThisWeek = data?.new_companies_this_week ?? 0
  const revenue = Math.round(data?.monthly_revenue ?? 0)
  const paidPlans = data?.paid_plans ?? 0
  const freePlans = data?.free_plans ?? 0
  const activeCount = data?.active_companies ?? 0
  const suspendedCount = data?.suspended_companies ?? 0
  const recent = data?.recent_companies ?? []

  const statCards = [
    {
      label: 'Total Companies',
      value: totalCompanies,
      detail: joinedThisWeek ? (
        <span className="inline-flex items-center gap-1">
          <UpArrow />
          {joinedThisWeek} this week
        </span>
      ) : (
        'No new companies this week'
      ),
      detailColor: joinedThisWeek ? 'text-emerald-600' : 'text-neutral-400',
    },
    {
      label: 'Monthly Revenue',
      value: `$${revenue.toLocaleString('en-US')}`,
      detail: `From ${paidPlans} paid plan${paidPlans === 1 ? '' : 's'}`,
      detailColor: 'text-neutral-400',
    },
    {
      label: 'Active Companies',
      value: activeCount,
      detail: suspendedCount
        ? `${suspendedCount} suspended`
        : `Of ${totalCompanies} compan${totalCompanies === 1 ? 'y' : 'ies'}`,
      detailColor: suspendedCount ? 'text-red-500' : 'text-neutral-400',
    },
    {
      label: 'Paid Plans',
      value: paidPlans,
      detail: `${freePlans} on Free`,
      detailColor: 'text-neutral-400',
    },
  ]

  return (
    <div className="space-y-4">
      {status === 'error' && <ErrorToast message={error} onClose={() => setStatus('ready')} />}

      {status === 'loading' ? (
        <StatSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-lg border border-neutral-200 bg-white p-5">
              <p className="text-sm text-neutral-500">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-black">{card.value}</p>
              <p className={`mt-2 text-xs font-medium ${card.detailColor}`}>{card.detail}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Recent Companies</h2>
          <Link
            to="/super-admin/companies"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 transition hover:text-brand-600"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] table-even-gaps text-left text-sm">
            <thead>
              <SpacedRow header className="border-b border-neutral-200 text-xs font-semibold text-neutral-500">
                <th className="px-4 py-3">Company</th>
                <th className="px-3 py-3">Channels</th>
                <th className="px-3 py-3">Plan</th>
                <th className="px-3 py-3">Joined</th>
                <th className="px-3 py-3">Status</th>
              </SpacedRow>
            </thead>
            <tbody>
              {status === 'loading' &&
                Array.from({ length: RECENT_LIMIT }).map((_, i) => <RecentRowSkeleton key={i} />)}
              {status !== 'loading' && recent.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-neutral-400">
                    No companies yet
                  </td>
                </tr>
              )}
              {recent.map((c, i) => {
                const name = c.name || c.email || 'Unnamed'
                const companyStatus = c.status || (c.is_active ? 'Active' : 'Inactive')
                return (
                  <SpacedRow key={c.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {c.avatar_url ? (
                          <img
                            src={c.avatar_url}
                            alt=""
                            className="h-9 w-9 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColors[i % avatarColors.length]}`}
                          >
                            {getInitials(name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-black">{name}</p>
                          {c.email && c.email !== name && (
                            <p className="truncate text-xs text-neutral-500">{c.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <ChannelBadges accounts={c.connected_accounts || channelsById[c.id] || []} />
                    </td>
                    <td className="px-3 py-3.5 text-neutral-600">
                      {c.plan_name || 'Free'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-neutral-500">
                      {formatRelativeTime(c.joined_at) || '—'}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[companyStatus] || statusStyles.Inactive}`}
                      >
                        {companyStatus}
                      </span>
                    </td>
                  </SpacedRow>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
