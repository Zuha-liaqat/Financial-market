import { Link } from 'react-router-dom'
import { Coins } from 'lucide-react'
import { useCredits } from '../lib/useCredits'
import { CREDITS_PER_POST } from '../data/subscriptionPlans'

// Credit balance strip shown at the top of the Create Post, Create Blog and Planner pages.
export default function CreditsBar() {
  const credits = useCredits()

  if (credits.status === 'error') return null

  if (credits.status === 'loading') {
    return <div className="h-15 animate-pulse rounded-lg border border-neutral-200 bg-white" />
  }

  const unlimited = credits.total === null
  const percent = unlimited || !credits.total ? 100 : Math.round((credits.remaining / credits.total) * 100)

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-neutral-200 bg-white px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
          <Coins className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-black">
            {unlimited ? (
              'Unlimited credits'
            ) : (
              <>
                {credits.remaining.toLocaleString('en-US')}
                <span className="font-normal text-neutral-400"> / {credits.total.toLocaleString('en-US')}</span> credits
                left
              </>
            )}
          </p>
          <p className="truncate text-xs text-neutral-500">
            {credits.planName} plan · {CREDITS_PER_POST} credits per post
          </p>
        </div>
      </div>

      <div className="flex w-full items-center gap-3 sm:w-auto">
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 sm:w-40 sm:flex-none"
          role="progressbar"
          aria-label="Credits left"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
        </div>
        <Link
          to="/super-admin/subscriptions"
          className="shrink-0 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
        >
          Get more
        </Link>
      </div>
    </div>
  )
}
