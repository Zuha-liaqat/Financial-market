import { Link } from 'react-router-dom'
import { Coins } from 'lucide-react'
import { useCredits } from '../lib/useCredits'
import { CREDITS_PER_POST } from '../data/subscriptionPlans'

function formatNumber(n) {
  return n.toLocaleString('en-US')
}

// Total credit balance in the header; links to Plans & Billing to get more.
export default function HeaderCredits() {
  const credits = useCredits()

  if (credits.status === 'error') return null
  if (credits.status === 'loading') {
    return <span className="h-8 w-24 animate-pulse rounded-full bg-brand-50" />
  }

  const unlimited = credits.total === null
  const breakdown = unlimited
    ? `${credits.planName} plan · unlimited credits`
    : `${credits.planName} plan ${formatNumber(credits.planCredits)}` +
      (credits.referralCredits > 0 ? ` + ${formatNumber(credits.referralCredits)} referral` : '') +
      ` · ${CREDITS_PER_POST} credits per post`

  return (
    <Link
      to="/subscriptions"
      title={breakdown}
      aria-label={unlimited ? 'Unlimited credits' : `${formatNumber(credits.total)} credits. ${breakdown}`}
      className="flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pr-3 pl-1 text-sm font-semibold text-brand-800 ring-1 ring-brand-100 transition hover:bg-brand-100"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-brand-600 text-white">
        <Coins className="h-3.5 w-3.5" />
      </span>
      {unlimited ? 'Unlimited' : formatNumber(credits.total)}
      <span className="hidden font-medium text-brand-600 sm:inline">credits</span>
    </Link>
  )
}
