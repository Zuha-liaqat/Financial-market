import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { avatarColors } from '../../data/companies'
import { apiAdminListPlans, apiListUsers } from '../../lib/api'
import { formatRelativeTime } from '../../lib/posts'
import { ErrorToast } from '../../components/Toast'

const RECENT_LIMIT = 5
const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const PAID_PLAN_STATUSES = new Set(['succeeded', 'active', 'paid'])

const statusStyles = {
  Active: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
  Inactive: 'bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200',
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

function isPaidPlan(plan) {
  return Boolean(plan) && plan.plan_code !== 'free' && PAID_PLAN_STATUSES.has(String(plan.status).toLowerCase())
}

// Monthly value of what the company actually paid; yearly payments are spread over 12 months.
function monthlyRevenueFor(user) {
  const plan = user.plan
  if (!isPaidPlan(plan)) return 0
  const amount = Number(plan.amount) || 0
  const label = `${plan.plan_name || ''} ${plan.product_name || ''}`.toLowerCase()
  return label.includes('yearly') ? amount / 12 : amount
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
    <tr className="border-b border-neutral-100 last:border-0">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-3.5 w-32 animate-pulse rounded bg-neutral-200" />
        </div>
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
    </tr>
  )
}

export default function AdminDashboardPage() {
  const [companies, setCompanies] = useState([])
  const [plans, setPlans] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([apiListUsers(), apiAdminListPlans().catch(() => [])])
      .then(([users, planList]) => {
        if (cancelled) return
        setCompanies((users || []).filter((u) => !u.is_superuser && u.role !== 'superadmin'))
        setPlans(planList || [])
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

  const weekAgo = Date.now() - WEEK_MS
  const joinedThisWeek = companies.filter((c) => c.created_at && new Date(c.created_at).getTime() >= weekAgo).length
  const activeCount = companies.filter((c) => c.is_active).length
  const revenue = Math.round(
    companies.filter((c) => c.is_active).reduce((sum, c) => sum + monthlyRevenueFor(c), 0),
  )
  const payingCount = companies.filter((c) => c.is_active && isPaidPlan(c.plan)).length
  const recent = [...companies]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, RECENT_LIMIT)

  const statCards = [
    {
      label: 'Total Companies',
      value: companies.length,
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
      detail: `From ${payingCount} paid plan${payingCount === 1 ? '' : 's'}`,
      detailColor: 'text-neutral-400',
    },
    {
      label: 'Active Companies',
      value: activeCount,
      detail: `Of ${companies.length} compan${companies.length === 1 ? 'y' : 'ies'}`,
      detailColor: 'text-neutral-400',
    },
    {
      label: 'Paid Plans',
      value: payingCount,
      detail: `${activeCount - payingCount} on Free`,
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
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs font-semibold text-neutral-500">
                <th className="px-4 py-3">Company</th>
                <th className="px-3 py-3">Plan</th>
                <th className="px-3 py-3">Joined</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' &&
                Array.from({ length: RECENT_LIMIT }).map((_, i) => <RecentRowSkeleton key={i} />)}
              {status !== 'loading' && recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-400">
                    No companies yet
                  </td>
                </tr>
              )}
              {recent.map((c, i) => {
                const name = c.name || c.email || 'Unnamed'
                const companyStatus = c.is_active ? 'Active' : 'Inactive'
                return (
                  <tr key={c.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColors[i % avatarColors.length]}`}
                        >
                          {getInitials(name)}
                        </div>
                        <p className="truncate font-medium text-black">{name}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-neutral-600">
                      {plans.find((p) => p.code === c.plan?.plan_code)?.name || c.plan?.plan_name || 'Free'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-neutral-500">
                      {formatRelativeTime(c.created_at) || '—'}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[companyStatus]}`}
                      >
                        {companyStatus}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
