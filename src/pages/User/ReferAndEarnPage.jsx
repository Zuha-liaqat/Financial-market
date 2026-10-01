import { useEffect, useState } from 'react'
import { Check, Clock, Coins, Copy, Gift, Send, UserCheck, Users } from 'lucide-react'
import Pagination from '../../components/Pagination'
import SpacedRow from '../../components/SpacedRow'
import { apiGetCompanyReferralLink, apiGetCompanyReferrals, apiSendCompanyReferral } from '../../lib/api'
import { useCurrentUser } from '../../lib/useCurrentUser'

const CREDITS_PER_JOIN = 100
const PAGE_SIZE = 5

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
  Joined: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
}

const statusDotColor = {
  Pending: 'bg-amber-500',
  Joined: 'bg-emerald-500',
}

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

const sourceLabels = {
  email: 'Email',
  link: 'Link',
}

function capitalize(value) {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function toInviteRows(invites) {
  return (invites || []).map((inv, i) => ({
    id: `${i}-${inv.invited_email}`,
    email: inv.invited_email,
    status: capitalize(inv.status),
    source: sourceLabels[inv.source] || capitalize(inv.source) || '—',
    credits: inv.credits ?? 0,
    sentAt: inv.sent_at,
  }))
}

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function StatCard({ icon: Icon, label, value, chip, loading }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${chip}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-medium text-neutral-500">{label}</p>
        {loading ? (
          <div className="mt-2 h-6 w-12 animate-pulse rounded bg-neutral-200" />
        ) : (
          <p className="mt-1 text-2xl font-semibold text-black">{value}</p>
        )}
      </div>
    </div>
  )
}

function RowSkeleton() {
  return (
    <SpacedRow className="border-b border-neutral-100 last:border-0">
      {['w-44', 'w-16', 'w-12', 'w-8', 'w-20'].map((w, i) => (
        <td key={i} className={i === 0 ? 'px-4 py-3.5' : 'px-3 py-3.5'}>
          <div className={`h-3.5 animate-pulse rounded bg-neutral-200 ${w}`} />
        </td>
      ))}
    </SpacedRow>
  )
}

export default function ReferAndEarnPage() {
  const { user } = useCurrentUser()
  const [summary, setSummary] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [friendEmail, setFriendEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [copied, setCopied] = useState(false)
  const [referralLink, setReferralLink] = useState('')
  const [linkError, setLinkError] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    apiGetCompanyReferralLink()
      .then((body) => !cancelled && setReferralLink(body?.referral_link || ''))
      .catch((err) => !cancelled && setLinkError(err.message))
    return () => {
      cancelled = true
    }
  }, [])

  function loadReferrals() {
    return apiGetCompanyReferrals()
      .then((body) => {
        setSummary(body)
        setLoadError('')
        setLoadState('ready')
      })
      .catch((err) => {
        setLoadError(err.message)
        setLoadState('error')
      })
  }

  useEffect(() => {
    loadReferrals()
  }, [])

  const loading = loadState === 'loading'
  const referrals = toInviteRows(summary?.invites)
  const paginated = referrals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleCopy() {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("Couldn't copy the link. Please copy it manually.")
    }
  }

  async function handleInvite(e) {
    e.preventDefault()
    setError('')
    setSentTo('')
    const friend = friendEmail.trim().toLowerCase()
    if (friend === user?.email?.trim().toLowerCase()) {
      setError("You can't invite your own email address.")
      return
    }
    if (referrals.some((r) => r.email?.toLowerCase() === friend)) {
      setError('You have already invited this email.')
      return
    }
    setSending(true)
    try {
      const body = await apiSendCompanyReferral(friend)
      if (body?.referral_link) setReferralLink(body.referral_link)
      await loadReferrals()
      setPage(1)
      setSentTo(friend)
      setFriendEmail('')
    } catch (err) {
      setError(err.message || 'Failed to send invite.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <Gift className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-black">Invite friends, earn credits</h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              You can invite as many people as you like. You get {CREDITS_PER_JOIN} credits for every friend who
              joins.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label htmlFor="referral-link" className="mb-1.5 block text-xs font-medium text-neutral-500">
              Your referral link
            </label>
            <div className="flex gap-2">
              <input
                id="referral-link"
                readOnly
                value={referralLink || (linkError ? "Couldn't load your link" : 'Loading…')}
                onFocus={(e) => e.target.select()}
                className={`${inputClass} bg-neutral-50 text-neutral-600`}
              />
              <button
                type="button"
                onClick={handleCopy}
                disabled={!referralLink}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-neutral-700 ring-1 ring-neutral-200 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <form onSubmit={handleInvite}>
            <label htmlFor="friend-email" className="mb-1.5 block text-xs font-medium text-neutral-500">
              Invite by email
            </label>
            <div className="flex gap-2">
              <input
                id="friend-email"
                type="email"
                required
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                placeholder="friend@company.com"
                className={inputClass}
              />
              <button
                type="submit"
                disabled={sending}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {sending ? 'Sending…' : 'Invite'}
              </button>
            </div>
          </form>
        </div>

        {linkError && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{linkError}</p>
        )}
        {sentTo && (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Invite sent to {sentTo}.
          </p>
        )}
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="People invited"
          value={summary?.people_invited ?? 0}
          chip="bg-sky-100 text-sky-600"
          loading={loading}
        />
        <StatCard
          icon={UserCheck}
          label="Joined"
          value={summary?.joined ?? 0}
          chip="bg-emerald-100 text-emerald-600"
          loading={loading}
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={summary?.pending ?? 0}
          chip="bg-orange-100 text-orange-600"
          loading={loading}
        />
        <StatCard
          icon={Coins}
          label="Credits earned"
          value={(summary?.credits_earned ?? 0).toLocaleString('en-US')}
          chip="bg-amber-100 text-amber-600"
          loading={loading}
        />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-4 py-3">
          <h3 className="text-sm font-bold tracking-wide text-neutral-800">YOUR INVITES</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 table-even-gaps text-left text-sm">
            <thead>
              <SpacedRow
                header
                className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-semibold tracking-widest text-neutral-400"
              >
                <th className="px-4 py-3.5">INVITED EMAIL</th>
                <th className="px-3 py-3.5">STATUS</th>
                <th className="px-3 py-3.5">SOURCE</th>
                <th className="px-3 py-3.5">CREDITS</th>
                <th className="px-3 py-3.5">SENT</th>
              </SpacedRow>
            </thead>
            <tbody>
              {loading && Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}
              {paginated.map((r) => (
                <SpacedRow key={r.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3.5 font-medium text-black">{r.email}</td>
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
        {loading ? null : loadState === 'error' ? (
          <div className="p-10 text-center text-sm text-red-500">{loadError || "Couldn't load your invites."}</div>
        ) : referrals.length === 0 ? (
          <div className="p-10 text-center text-sm text-neutral-400">
            No invites yet. Share your link to get started.
          </div>
        ) : (
          <Pagination page={page} pageSize={PAGE_SIZE} total={referrals.length} onChange={setPage} />
        )}
      </div>
    </div>
  )
}
